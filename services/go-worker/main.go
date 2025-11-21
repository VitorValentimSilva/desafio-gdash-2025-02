package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Estrutura mínima que o produtor envia (ajuste se você alterou o payload)
type WeatherPayload struct {
	ID         string                 `json:"id"`
	CollectedAt string                `json:"collected_at"`
	Source     string                 `json:"source"`
	Location   map[string]interface{} `json:"location"`
	Current    map[string]interface{} `json:"current"`
	Raw        json.RawMessage        `json:"raw,omitempty"`
}

var (
	rabbitURL   string
	queueName   string
	nestAPIURL  string
	maxRetries  int
	httpTimeout time.Duration
)

func initFromEnv() {
	rabbitURL = getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	queueName = getenv("RABBITMQ_QUEUE", "weather_queue")
	nestAPIURL = getenv("NEST_API_URL", "http://nest-api:3000")
	maxRetries = getenvInt("WORKER_MAX_RETRIES", 3)
	httpTimeout = time.Duration(getenvInt("WORKER_HTTP_TIMEOUT_SECONDS", 10)) * time.Second
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getenvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return def
}

func main() {
	initFromEnv()
	log.Printf("worker starting → RABBITMQ=%s QUEUE=%s NEST_API=%s\n", rabbitURL, queueName, nestAPIURL)

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("failed to open channel: %v", err)
	}
	defer ch.Close()

	// QoS: 1 message por worker para evitar paralelismo descontrolado
	if err := ch.Qos(1, 0, false); err != nil {
		log.Fatalf("failed to set QoS: %v", err)
	}

	// garante a fila exista
	_, err = ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		log.Fatalf("queue declare failed: %v", err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",    // consumer
		false, // auto-ack -> false, fare ack manual
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("failed to register consumer: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	wg := sync.WaitGroup{}

	// signal handling (graceful shutdown)
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	// worker goroutine: processa mensagens
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case <-ctx.Done():
				log.Println("worker: shutdown requested, exiting consumer loop")
				return
			case d, ok := <-msgs:
				if !ok {
					log.Println("worker: delivery channel closed")
					return
				}
				processDelivery(ch, &d)
			}
		}
	}()

	<-sigCh
	log.Println("worker: received shutdown signal")
	cancel()
	// espera goroutines terminarem
	wg.Wait()
	log.Println("worker: shutdown complete")
}

// processDelivery trata uma única mensagem
func processDelivery(ch *amqp.Channel, d *amqp.Delivery) {
	log.Printf("received delivery (len=%d) headers=%v", len(d.Body), d.Headers)

	// desserializa
	var payload WeatherPayload
	if err := json.Unmarshal(d.Body, &payload); err != nil {
		log.Printf("invalid JSON payload: %v — nack and discard", err)
		// se payload inválido, ack para descartar
		if err := d.Ack(false); err != nil {
			log.Printf("ack failed: %v", err)
		}
		return
	}

	// validações básicas
	if err := validatePayload(&payload); err != nil {
		log.Printf("payload validation failed: %v — ack and discard", err)
		if err := d.Ack(false); err != nil {
			log.Printf("ack failed: %v", err)
		}
		return
	}

	// faz POST para API NestJS
	err := postToNest(&payload)
	if err == nil {
		// sucesso → ack
		if err := d.Ack(false); err != nil {
			log.Printf("ack failed after success: %v", err)
		} else {
			log.Printf("processed and acked id=%s", payload.ID)
		}
		return
	}

	// falha → retry logic
	attempts := extractRetries(d.Headers)
	if attempts < maxRetries {
		attempts++
		log.Printf("post failed (attempt %d/%d) id=%s err=%v — republishing with x-retries=%d", attempts, maxRetries, payload.ID, err, attempts)
		// republisha message with header incremented
		headers := amqp.Table{}
		for k, v := range d.Headers {
			headers[k] = v
		}
		headers["x-retries"] = attempts

		pubErr := ch.Publish(
			"",        // exchange
			queueName, // routing key = queue
			false,
			false,
			amqp.Publishing{
				DeliveryMode: amqp.Persistent,
				ContentType:  "application/json",
				Body:         d.Body,
				Headers:      headers,
			},
		)
		if pubErr != nil {
			log.Printf("failed to republish for retry: %v — will nack and requeue", pubErr)
			// tenta nack com requeue true para não perder a mensagem
			if nackErr := d.Nack(false, true); nackErr != nil {
				log.Printf("nack failed: %v", nackErr)
			}
			return
		}
		// publiquei novo message; ack original para remover
		if err := d.Ack(false); err != nil {
			log.Printf("ack failed after republish: %v", err)
		}
		return
	}

	// excedeu retries → move para dead/failure queue (opcional)
	failedQ := "failed_"+queueName
	log.Printf("exceeded retries for id=%s — publishing to %s and acking original", payload.ID, failedQ)
	// garante fila failed
	_, qerr := ch.QueueDeclare(
		failedQ,
		true,  // durable
		false, // delete when unused
		false,
		false,
		nil,
	)
	if qerr != nil {
		log.Printf("failed to declare failed queue: %v", qerr)
	}
	pubErr := ch.Publish(
		"",      // default exchange
		failedQ, // routing key
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         d.Body,
			Headers:      d.Headers,
		},
	)
	if pubErr != nil {
		log.Printf("failed to publish to failed queue: %v — nack and discard", pubErr)
		// se não conseguir republicar, ack para não ficar preso
		if nackErr := d.Nack(false, false); nackErr != nil {
			log.Printf("final nack failed: %v", nackErr)
		}
		return
	}
	// ack original
	if err := d.Ack(false); err != nil {
		log.Printf("ack failed after moving to failed queue: %v", err)
	}
}

func validatePayload(p *WeatherPayload) error {
	if p.ID == "" {
		return errors.New("missing id")
	}
	if p.Current == nil {
		return errors.New("missing current")
	}
	// checa temperatura se existe
	if _, ok := p.Current["temperature_c"]; !ok {
		// pode ser nil dependendo do produtor — é só exemplo
		return errors.New("current.temperature_c missing")
	}
	return nil
}

func postToNest(p *WeatherPayload) error {
	client := &http.Client{Timeout: httpTimeout}

	// envia payload tal como recebido (pode ser transformado)
	bodyBytes, err := json.Marshal(p)
	if err != nil {
		return err
	}

	url := nestAPIURL + "/api/weather/logs"
	req, err := http.NewRequest("POST", url, bytes.NewReader(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// HTTP 2xx é sucesso
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}
	return errors.New("non-2xx response: " + resp.Status)
}

// extrai tentativas do header x-retries
func extractRetries(headers amqp.Table) int {
	if headers == nil {
		return 0
	}
	if v, ok := headers["x-retries"]; ok {
		switch t := v.(type) {
		case int:
			return t
		case int32:
			return int(t)
		case int64:
			return int(t)
		case float64:
			return int(t)
		case string:
			if i, err := strconv.Atoi(t); err == nil {
				return i
			}
		}
	}
	return 0
}
