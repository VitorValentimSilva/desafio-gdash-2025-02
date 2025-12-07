import { I18nService } from 'nestjs-i18n';

interface WeatherRow {
  current?: {
    temperature_c?: number;
    relative_humidity_percent?: number;
    precipitation_probability_percent?: number;
  };
}

export function computeInsightsFromRows(
  rows: WeatherRow[],
  i18n: I18nService,
  period = 24,
) {
  const selected = rows.slice(0, period);

  if (!selected.length) {
    return {
      generated_at: new Date().toISOString(),
      samples: 0,
      summary: i18n.t('weather.noData'),
      alerts: [],
    };
  }

  const temps: number[] = [];
  const hums: number[] = [];
  const rains: number[] = [];

  for (const r of selected) {
    const c = r.current || {};
    if (typeof c.temperature_c === 'number') temps.push(c.temperature_c);
    if (typeof c.relative_humidity_percent === 'number')
      hums.push(c.relative_humidity_percent);
    if (typeof c.precipitation_probability_percent === 'number')
      rains.push(c.precipitation_probability_percent);
  }

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  const avgTemp = avg(temps);
  const avgHum = avg(hums);

  let trend: 'rising' | 'falling' | 'stable' = 'stable';
  if (temps.length > 6) {
    const firstAvg = temps.slice(-6).reduce((a, b) => a + b, 0) / 6;
    const lastAvg = temps.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
    if (lastAvg > firstAvg + 1) trend = 'rising';
    else if (lastAvg < firstAvg - 1) trend = 'falling';
  }

  const comfort =
    avgTemp != null && avgHum != null
      ? Math.max(
          0,
          100 - Math.abs(avgTemp - 22) * 2 - Math.abs(avgHum - 55) * 0.5,
        )
      : null;

  const classify = (t: number | null) => {
    if (t == null) return i18n.t('weather.unknown');
    if (t < 12) return i18n.t('weather.cold');
    if (t < 18) return i18n.t('weather.pleasant');
    if (t < 26) return i18n.t('weather.warm');
    return i18n.t('weather.hot');
  };

  const classification = classify(avgTemp);

  const alerts: string[] = [];
  const rainAvg = avg(rains) ?? 0;
  if (rainAvg > 60) alerts.push(i18n.t('weather.highChanceOfRain'));
  if (avgTemp != null && avgTemp > 30)
    alerts.push(i18n.t('weather.extremeHeat'));
  if (avgTemp != null && avgTemp < 10)
    alerts.push(i18n.t('weather.intenseCold'));

  const header = i18n.t('weather.summary.header', {
    args: { length: selected.length },
  });
  const avgTempLine = i18n.t('weather.summary.avgTemp', {
    args: { value: avgTemp?.toFixed(1) ?? '-' },
  });
  const avgHumLine = i18n.t('weather.summary.avgHum', {
    args: { value: avgHum?.toFixed(0) ?? '-' },
  });
  const trendLine = i18n.t('weather.summary.trend', { args: { value: trend } });
  const classLine = i18n.t('weather.summary.classification', {
    args: { value: classification },
  });
  const comfortLine = i18n.t('weather.summary.comfort', {
    args: { value: comfort != null ? Math.round(comfort) : '-' },
  });

  const summary = [
    header,
    `- ${avgTempLine}`,
    `- ${avgHumLine}`,
    `- ${trendLine}`,
    `- ${classLine}`,
    `- ${comfortLine}`,
  ].join('\n');

  return {
    generated_at: new Date().toISOString(),
    samples: selected.length,
    avg_temperature: avgTemp,
    avg_humidity: avgHum,
    temp_trend: trend,
    comfort_score: Math.round(comfort ?? 0),
    condition_classification: classification,
    alerts,
    summary,
  };
}
