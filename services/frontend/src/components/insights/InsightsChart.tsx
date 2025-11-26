import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatTemp, formatHumidity } from "@/lib/weather";
import type { WeatherLog } from "@/types/weather";

function buildSeries(logs: WeatherLog[]) {
  const slice = (logs ?? []).slice(0, 200);
  const sorted = [...slice].sort(
    (a, b) =>
      new Date(a.collected_at).getTime() - new Date(b.collected_at).getTime()
  );

  return sorted.map((l) => {
    const time = new Date(l.collected_at);
    const label = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const temp =
      typeof l.current?.temperature_c === "number"
        ? l.current.temperature_c
        : typeof l.current?.temperature === "number"
        ? l.current.temperature
        : null;
    const humidity =
      typeof l.current?.relative_humidity_percent === "number"
        ? l.current.relative_humidity_percent
        : null;
    return {
      label,
      temp: temp === null ? null : Number(temp),
      humidity: humidity === null ? null : Number(humidity),
    };
  });
}

export default function InsightsChart({ logs }: { logs: WeatherLog[] }) {
  const series = useMemo(() => buildSeries(logs), [logs]);
  const xInterval = Math.max(0, Math.floor(series.length / 8));

  return (
    <div className="bg-surface/6 p-4 rounded-lg border">
      <h4 className="text-sm font-medium mb-3">Histórico (temp & umidade)</h4>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.08} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={xInterval}
              minTickGap={8}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              domain={["dataMin - 5", "dataMax + 5"]}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
            />

            <Tooltip
              formatter={(value: number | string, name: string) => {
                if (name.includes("Temp"))
                  return [formatTemp(Number(value)), name];
                if (name.includes("Umidade"))
                  return [formatHumidity(Number(value)), name];
                return [value, name];
              }}
              labelFormatter={(label) => `Horário: ${label}`}
            />

            <Legend verticalAlign="bottom" height={36} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temp"
              name="Temperatura (°C)"
              stroke="#FF7A18"
              dot={false}
              strokeWidth={2}
              connectNulls={true}
              isAnimationActive={false}
              activeDot={{ r: 4 }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              name="Umidade (%)"
              stroke="#2EB3FF"
              dot={false}
              strokeWidth={2}
              connectNulls={true}
              isAnimationActive={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
