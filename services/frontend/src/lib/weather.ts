import type { WeatherLog } from "@/types/weather";
import type { TFunction } from "i18next";

export function weatherCodeToText(
  code: number | string | undefined,
  t: TFunction<"weather">
): string {
  if (code === undefined || code === null) return t("undefined");
  const c = typeof code === "string" ? parseInt(code, 10) : code;

  if (c >= 0 && c <= 1) return t("sunny");
  if (c === 2) return t("partlyCloudy");
  if (c === 3) return t("cloudy");
  if (c >= 45 && c <= 48) return t("fog");
  if (c >= 51 && c <= 67) return t("rain");
  if (c >= 71 && c <= 77) return t("nevada");
  if (c >= 80 && c <= 82) return t("rainSparse");
  if (c >= 85 && c <= 86) return t("swow");
  if (c >= 95) return t("storm");
  return t("undefined");
}

export function weatherCodeToCategory(
  code: number
):
  | "sun"
  | "cloud"
  | "fog"
  | "rain"
  | "drizzle"
  | "snow"
  | "thunder"
  | "unknown" {
  if (code >= 0 && code <= 1) return "sun";
  if (code === 2) return "cloud";
  if (code === 3) return "cloud";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 55) return "drizzle";
  if (code >= 56 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";

  if (code >= 95) return "thunder";

  return "unknown";
}

export function formatTemp(t?: number | null) {
  if (t == null || Number.isNaN(t)) return "—";
  return `${Math.round(t)}°C`;
}

export function formatHumidity(h?: number | null) {
  if (h == null || Number.isNaN(h)) return "—";
  return `${Math.round(h)}%`;
}

export function mapWeatherRecord(
  log: WeatherLog,
  t: TFunction<"weather">,
  locale: string
) {
  const c = log.current || {};
  const loc = log.location || {};

  return {
    datetime: new Date(log.collected_at).toLocaleString(locale),
    location: loc.city ?? t("undefined"),
    condition: c.weathercode !== undefined ? String(c.weathercode) : "-",
    temp: c.temperature_c !== undefined ? `${c.temperature_c}°C` : "-",
    humidity:
      c.relative_humidity_percent !== undefined
        ? `${c.relative_humidity_percent}%`
        : "-",
  };
}
