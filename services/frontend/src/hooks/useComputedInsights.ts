import { useMemo } from "react";
import {
  average,
  simpleTrend,
  comfortScore,
  getSeriesFromLogs,
} from "@/lib/stats";
import { weatherCodeToText } from "@/lib/weather";
import type { WeatherLog } from "@/types/weather";

export function useComputedInsights(logs: WeatherLog[]) {
  const summary = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const series = getSeriesFromLogs(logs);
    const temps = series.map((s) => s.temp as number);
    const hums = series
      .map((s) => s.humidity as number)
      .filter((h) => h != null) as number[];

    const avgTemp = average(temps) ?? null;
    const avgHum = hums.length ? average(hums) : null;
    const trend = simpleTrend(temps);
    const comfort = comfortScore(avgTemp, avgHum ?? null);

    let classification = "Agradável";
    if (avgTemp != null) {
      if (avgTemp >= 30) classification = "Quente";
      else if (avgTemp <= 12) classification = "Frio";
      else classification = "Agradável";
    }

    const alerts: string[] = [];

    const latest = logs[0];
    const wcText = weatherCodeToText(
      latest.current.weathercode as unknown as number
    );
    if (/chuva|tempestade|chuvisco|rain/i.test(String(wcText))) {
      alerts.push("Alta chance de chuva nas próximas horas");
    }
    if (avgTemp != null && avgTemp >= 34)
      alerts.push("Calor extremo — hidratar-se");
    if (avgTemp != null && avgTemp <= 5) alerts.push("Frio intenso — cuidado");

    const textParts: string[] = [];
    if (avgTemp != null) textParts.push(`Temp média: ${Math.round(avgTemp)}°C`);
    if (avgHum != null) textParts.push(`Umidade média: ${Math.round(avgHum)}%`);
    if (alerts.length) textParts.push(`Alertas: ${alerts.join("; ")}`);

    return {
      samples: temps.length,
      average_temperature_c: avgTemp,
      average_humidity_percent: avgHum,
      trend,
      comfort_score: comfort,
      classification,
      alerts,
      text: textParts.join(" • "),
      series,
    };
  }, [logs]);

  return summary;
}
