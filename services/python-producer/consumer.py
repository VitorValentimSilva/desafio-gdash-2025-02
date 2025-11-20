import pika, json, os

url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
conn = pika.BlockingConnection(pika.URLParameters(url))
ch = conn.channel()
ch.queue_declare(queue="weather_queue", durable=True)

def callback(ch, method, properties, body):
    data = json.loads(body)
    print("Recebido:", data["id"], data["current"]["temperature_c"], "C")
    ch.basic_ack(delivery_tag=method.delivery_tag)

ch.basic_consume("weather_queue", callback)
print("Esperando mensagens...")
ch.start_consuming()
