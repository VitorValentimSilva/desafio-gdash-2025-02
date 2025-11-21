# test_publish_bad_missing_temp.py
import json, os
import pika, uuid
from datetime import datetime
url = os.getenv("RABBITMQ_URL","amqp://guest:guest@localhost:5672/")
conn = pika.BlockingConnection(pika.URLParameters(url))
ch = conn.channel()
ch.queue_declare(queue="weather_queue", durable=True)
payload = {
    "id": str(uuid.uuid4()),
    "collected_at": datetime.now().isoformat(),
    "source": "test",
    "location": {"city": "PP"},
    "current": {"time": datetime.now().isoformat()}  # sem temperature_c
}
ch.basic_publish("", "weather_queue", json.dumps(payload).encode(), pika.BasicProperties(content_type="application/json", delivery_mode=2))
print("published bad (missing temp)", payload["id"])
conn.close()
