#!/usr/bin/env python3
"""
producer.py
Coleta dados do Open-Meteo periodicamente e publica em fila RabbitMQ.
Config via ENV vars:
  LAT (default  -23.55052)
  LON (default -46.633308)
  CITY (default "Presidente Prudente")
  INTERVAL_SECONDS (default 3600)
  RABBITMQ_URL (default "amqp://guest:guest@rabbitmq:5672/")
  RABBITMQ_QUEUE (default "weather_queue")
"""
import os
import time
import json
import uuid
import signal
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

import requests
import pika

# --- Config / defaults from env ---
LAT = float(os.getenv("LAT", "-22.12556"))
LON = float(os.getenv("LON", "-51.38889"))
CITY = os.getenv("CITY", "Presidente Prudente")
INTERVAL_SECONDS = int(os.getenv("INTERVAL_SECONDS", "3600"))
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_queue")
OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"

# --- Logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("weather-producer")

running = True

def handle_sigterm(signum, frame):
    global running
    logger.info("Recebido sinal de término, encerrando loop...")
    running = False

signal.signal(signal.SIGINT, handle_sigterm)
signal.signal(signal.SIGTERM, handle_sigterm)

def fetch_open_meteo(lat: float, lon: float, timezone_str: str = "auto") -> Optional[Dict[str, Any]]:
    """Consulta Open-Meteo e devolve dicionário com dados relevantes."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": "true",
        "hourly": "relativehumidity_2m,precipitation_probability",
        "timezone": timezone_str
    }
    try:
        resp = requests.get(OPEN_METEO_BASE, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        # current weather
        cw = data.get("current_weather", {})
        hourly = data.get("hourly", {})
        # find index for current time in hourly.time
        cur_time = cw.get("time")
        humidity = None
        precipitation_prob = None
        if cur_time and hourly:
            times = hourly.get("time", [])
            try:
                idx = times.index(cur_time)
                hums = hourly.get("relativehumidity_2m", [])
                pops = hourly.get("precipitation_probability", [])
                if idx < len(hums):
                    humidity = hums[idx]
                if idx < len(pops):
                    precipitation_prob = pops[idx]
            except ValueError:
                # time not found; ignore
                pass

        result = {
            "id": str(uuid.uuid4()),
            "collected_at": datetime.now(timezone.utc).astimezone().isoformat(),
            "source": "open-meteo",
            "location": {
                "city": CITY,
                "latitude": lat,
                "longitude": lon
            },
            "current": {
                "time": cw.get("time"),
                "temperature_c": cw.get("temperature"),
                "wind_speed_m_s": cw.get("windspeed"),
                "wind_direction_deg": cw.get("winddirection"),
                "weathercode": cw.get("weathercode"),
                "relative_humidity_percent": humidity,
                "precipitation_probability_percent": precipitation_prob
            },
            "raw": data
        }
        return result
    except Exception as e:
        logger.exception("Erro ao buscar Open-Meteo: %s", e)
        return None

def connect_rabbitmq(url: str):
    """Cria conexão e canal com retry simples. Se a URL falhar por resolução DNS,
    tenta automaticamente versões com 'localhost' e '127.0.0.1'."""
    from urllib.parse import urlparse, urlunparse

    def try_connect(params):
        attempt = 0
        while True:
            try:
                conn = pika.BlockingConnection(params)
                channel = conn.channel()
                channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
                logger.info("Conectado ao RabbitMQ e fila '%s' declarada.", RABBITMQ_QUEUE)
                return conn, channel
            except Exception as e:
                attempt += 1
                wait = min(30, 2 ** min(6, attempt))
                logger.warning("Falha ao conectar RabbitMQ (attempt %d): %s — tentando em %ds", attempt, e, wait)
                time.sleep(wait)

    # tenta a URL original primeiro
    try:
        params = pika.URLParameters(url)
        return try_connect(params)
    except Exception as e:
        logger.debug("Tentativa inicial com URL original falhou: %s", e)

    # se falhar por DNS, tenta substituir hostname por localhost e 127.0.0.1
    try:
        parsed = urlparse(url)
        for alt_host in ("localhost", "127.0.0.1"):
            alt_netloc = f"{parsed.username}:{parsed.password}@{alt_host}:{parsed.port}"
            alt = parsed._replace(netloc=alt_netloc)
            alt_url = urlunparse(alt)
            logger.info("Tentando fallback RabbitMQ com URL: %s", alt_url)
            try:
                params = pika.URLParameters(alt_url)
                return try_connect(params)
            except Exception as inner_e:
                logger.debug("Fallback %s falhou: %s", alt_host, inner_e)
    except Exception:
        pass

    # como último recurso, tenta localhost sem parsing (caso URL fosse algo inesperado)
    return try_connect(pika.URLParameters("amqp://guest:guest@localhost:5672/"))

def publish(channel, queue_name: str, payload: dict):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    properties = pika.BasicProperties(content_type="application/json", delivery_mode=2)
    channel.basic_publish(exchange="", routing_key=queue_name, body=body, properties=properties)
    logger.info("Publicado mensagem id=%s time=%s", payload.get("id"), payload["collected_at"])


def main_loop():
    conn, channel = connect_rabbitmq(RABBITMQ_URL)
    try:
        while running:
            data = fetch_open_meteo(LAT, LON)
            if data:
                try:
                    publish(channel, RABBITMQ_QUEUE, data)
                except Exception as e:
                    logger.exception("Erro ao publicar no RabbitMQ: %s. Tentando reconectar.", e)
                    # tenta reconectar
                    try:
                        conn.close()
                    except Exception:
                        pass
                    conn, channel = connect_rabbitmq(RABBITMQ_URL)
            else:
                logger.warning("Nenhum dado retornado da API; pulando publicação.")

            # loop intervalado (sleep entre iterações)
            slept = 0
            while slept < INTERVAL_SECONDS and running:
                time.sleep(1)
                slept += 1
    finally:
        try:
            conn.close()
        except Exception:
            pass
        logger.info("Producer finalizado.")


if __name__ == "__main__":
    logger.info("Iniciando producer (lat=%s lon=%s city=%s interval=%ss)", LAT, LON, CITY, INTERVAL_SECONDS)
    main_loop()
