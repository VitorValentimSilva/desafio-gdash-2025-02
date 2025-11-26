export function weatherCodeToText(code: number | string | undefined): string {
  if (code === undefined || code === null) return "Desconhecido";
  const c = typeof code === "string" ? parseInt(code, 10) : code;

  if (c >= 0 && c <= 1) return "Ensolarado";
  if (c === 2) return "Parcialmente nublado";
  if (c === 3) return "Nublado";
  if (c >= 45 && c <= 48) return "Neblina";
  if (c >= 51 && c <= 67) return "Chuva/Chuvisco";
  if (c >= 71 && c <= 77) return "Nevando";
  if (c >= 80 && c <= 82) return "Chuvas esparsas";
  if (c >= 85 && c <= 86) return "Neve";
  if (c >= 95) return "Tempestade/Tempestade com trovões";
  return "Desconhecido";
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
