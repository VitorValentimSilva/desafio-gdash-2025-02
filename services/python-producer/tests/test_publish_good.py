# test_publish_good.py
import json, os
import pika
from datetime import datetime
import uuid

url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
params = pika.URLParameters(url)
conn = pika.BlockingConnection(params)
ch = conn.channel()
ch.queue_declare(queue="weather_queue", durable=True)

payload = {
    "id": str(uuid.uuid4()),
    "collected_at": datetime.now().isoformat(),
    "source": "test",
    "location": {"city": "Presidente Prudente", "latitude": -22.12556, "longitude": -51.38889},
    "current": {"time": datetime.now().isoformat(), "temperature_c": 25.4, "windspeed": 2.3},
}

ch.basic_publish(exchange="", routing_key="weather_queue",
                 body=json.dumps(payload).encode("utf-8"),
                 properties=pika.BasicProperties(content_type="application/json", delivery_mode=2))
print("published", payload["id"])
conn.close()
