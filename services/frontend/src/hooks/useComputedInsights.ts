import { useMemo } from "react";
import {
  average,
  simpleTrend,
  comfortScore,
  getSeriesFromLogs,
} from "@/lib/stats";
import { weatherCodeToText } from "@/lib/weather";
import type { WeatherLog } from "@/types/weather";
import type { TFunction } from "i18next";

export function useComputedInsights(
  logs: WeatherLog[],
  t: TFunction<"weather">
) {
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

    let classification = t("pleasant");
    if (avgTemp != null) {
      if (avgTemp >= 30) classification = t("warm");
      else if (avgTemp <= 12) classification = t("cold");
      else classification = t("pleasant");
    }

    const alerts: string[] = [];

    const latest = logs[0];
    const wcText = weatherCodeToText(
      latest.current.weathercode as unknown as number,
      t
    );
    if (/chuva|tempestade|chuvisco|rain/i.test(String(wcText))) {
      alerts.push(t("alerts.highChanceOfRain"));
    }
    if (avgTemp != null && avgTemp >= 34) alerts.push(t("alerts.extremeHeat"));
    if (avgTemp != null && avgTemp <= 5) alerts.push(t("alerts.extremeCold"));
    const textParts: string[] = [];
    if (avgTemp != null)
      textParts.push(t("textParts.avgTemp", { value: Math.round(avgTemp) }));
    if (avgHum != null)
      textParts.push(t("textParts.avgHumidity", { value: Math.round(avgHum) }));
    if (alerts.length)
      textParts.push(t("textParts.alerts", { value: alerts.join("; ") }));

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
  }, [logs, t]);

  return summary;
}
