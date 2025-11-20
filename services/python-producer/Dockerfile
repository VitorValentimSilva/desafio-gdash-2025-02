FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY producer.py .

ENV LAT="-23.55052"
ENV LON="-46.633308"
ENV CITY="São Paulo"
ENV INTERVAL_SECONDS="3600"
ENV RABBITMQ_URL="amqp://guest:guest@rabbitmq:5672/"
ENV RABBITMQ_QUEUE="weather_queue"

CMD ["python", "producer.py"]
