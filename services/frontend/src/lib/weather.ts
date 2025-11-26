export type WeatherCode = number | string;

const codeMap: Record<number, string> = {
  0: "Ensolarado",
  1: "Parcialmente nublado",
  2: "Nublado",
  3: "Nuvens altas",
  45: "Nevoeiro",
  48: "Nevoeiro com gelo",
  51: "Chuvisco leve",
  53: "Chuvisco moderado",
  55: "Chuvisco forte",
  56: "Chuvisco congelante leve",
  57: "Chuvisco congelante forte",
  61: "Chuva leve",
  63: "Chuva moderada",
  65: "Chuva forte",
  66: "Chuva congelante leve",
  67: "Chuva congelante forte",
  71: "Neve fraca",
  73: "Neve moderada",
  75: "Neve forte",
  77: "Granizo",
  80: "Pancadas de chuva (leve)",
  81: "Pancadas de chuva (moderada)",
  82: "Pancadas de chuva (forte)",
  85: "Pancadas de neve",
  86: "Pancadas de neve forte",
  95: "Trovoada",
  96: "Trovoada com granizo leve",
  99: "Trovoada com granizo forte",
};

export function weatherCodeToText(code: WeatherCode): string {
  if (code === null || code === undefined) return "Desconhecido";
  const n =
    typeof code === "string" && code.trim() !== ""
      ? Number(code)
      : (code as number);
  if (!Number.isFinite(n)) return String(code);
  return codeMap[n] ?? "Condição desconhecida";
}

export type WeatherCategory =
  | "rain"
  | "snow"
  | "thunder"
  | "sun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "unknown";

export function weatherCodeToCategory(code: WeatherCode): WeatherCategory {
  const n = typeof code === "string" ? Number(code) : (code as number);
  if (!Number.isFinite(n)) return "unknown";
  if (n === 0) return "sun";
  if ([1, 2, 3].includes(n)) return "cloud";
  if ([45, 48].includes(n)) return "fog";
  if ([51, 53, 55, 56, 57].includes(n)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(n)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(n)) return "snow";
  if ([95, 96, 99].includes(n)) return "thunder";
  return "unknown";
}
