import type { WeatherLog } from "@/types/weather";

export function mapWeatherRecord(log: WeatherLog) {
  const c = log.current || {};
  const loc = log.location || {};

  return {
    datetime: new Date(log.collected_at).toLocaleString("pt-BR"),
    location: loc.city ?? "Desconhecido",
    condition: c.weathercode !== undefined ? String(c.weathercode) : "-",
    temp: c.temperature_c !== undefined ? `${c.temperature_c}°C` : "-",
    humidity:
      c.relative_humidity_percent !== undefined
        ? `${c.relative_humidity_percent}%`
        : "-",
  };
}
