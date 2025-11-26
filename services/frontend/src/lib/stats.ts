import { type WeatherLog } from "@/types/weather";

export function average(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function simpleTrend(values: number[]) {
  if (values.length < 2) return 0;

  const n = values.length;
  const xs = values.map((_, i) => i);
  const avgX = average(xs) ?? 0;
  const avgY = average(values) ?? 0;
  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - avgX) * (values[i] - avgY);
    den += (xs[i] - avgX) ** 2;
  }
  if (den === 0) return 0;
  return num / den;
}

export function comfortScore(temp: number | null, humidity: number | null) {
  if (temp == null) return 50;
  let score = 100;

  const idealTemp = 22;
  const tempDiff = Math.abs(temp - idealTemp);
  score -= Math.min(60, tempDiff * 3.5);

  if (humidity != null) {
    const idealHum = 50;
    const humDiff = Math.abs(humidity - idealHum);
    score -= Math.min(40, humDiff * 0.6);
  } else {
    score -= 10;
  }
  score = Math.round(Math.max(0, Math.min(100, score)));
  return score;
}

export function getSeriesFromLogs(logs: WeatherLog[]) {
  return logs
    .map((l) => ({
      time: l.collected_at,
      temp: l.current.temperature_c ?? null,
      humidity: l.current.relative_humidity_percent ?? null,
    }))
    .filter((x) => x.temp !== null || x.humidity !== null);
}
