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

	if err := ch.Qos(1, 0, false); err != nil {
		log.Fatalf("failed to set QoS: %v", err)
	}

	_, err = ch.QueueDeclare(
		queueName,
		true, 
		false,
		false, 
		false, 
		nil,   
	)
	if err != nil {
		log.Fatalf("queue declare failed: %v", err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",   
		false, 
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

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

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
	wg.Wait()
	log.Println("worker: shutdown complete")
}

func processDelivery(ch *amqp.Channel, d *amqp.Delivery) {
	log.Printf("received delivery (len=%d) headers=%v", len(d.Body), d.Headers)

	var payload WeatherPayload
	if err := json.Unmarshal(d.Body, &payload); err != nil {
		log.Printf("invalid JSON payload: %v — nack and discard", err)

		if err := d.Ack(false); err != nil {
			log.Printf("ack failed: %v", err)
		}
		return
	}

	if err := validatePayload(&payload); err != nil {
		log.Printf("payload validation failed: %v — ack and discard", err)
		if err := d.Ack(false); err != nil {
			log.Printf("ack failed: %v", err)
		}
		return
	}

	err := postToNest(&payload)
	if err == nil {
		if err := d.Ack(false); err != nil {
			log.Printf("ack failed after success: %v", err)
		} else {
			log.Printf("processed and acked id=%s", payload.ID)
		}
		return
	}

	attempts := extractRetries(d.Headers)
	if attempts < maxRetries {
		attempts++
		log.Printf("post failed (attempt %d/%d) id=%s err=%v — republishing with x-retries=%d", attempts, maxRetries, payload.ID, err, attempts)

		headers := amqp.Table{}
		for k, v := range d.Headers {
			headers[k] = v
		}
		headers["x-retries"] = attempts

		pubErr := ch.Publish(
			"",        
			queueName, 
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

			if nackErr := d.Nack(false, true); nackErr != nil {
				log.Printf("nack failed: %v", nackErr)
			}
			return
		}

		if err := d.Ack(false); err != nil {
			log.Printf("ack failed after republish: %v", err)
		}
		return
	}

	failedQ := "failed_"+queueName
	log.Printf("exceeded retries for id=%s — publishing to %s and acking original", payload.ID, failedQ)

	_, qerr := ch.QueueDeclare(
		failedQ,
		true, 
		false, 
		false,
		false,
		nil,
	)
	if qerr != nil {
		log.Printf("failed to declare failed queue: %v", qerr)
	}
	pubErr := ch.Publish(
		"",     
		failedQ, 
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

		if nackErr := d.Nack(false, false); nackErr != nil {
			log.Printf("final nack failed: %v", nackErr)
		}
		return
	}

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

	if _, ok := p.Current["temperature_c"]; !ok {

		return errors.New("current.temperature_c missing")
	}
	return nil
}

func postToNest(p *WeatherPayload) error {
	client := &http.Client{Timeout: httpTimeout}

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

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}
	return errors.New("non-2xx response: " + resp.Status)
}

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
