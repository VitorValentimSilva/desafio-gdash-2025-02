import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "./ui/card";

interface TemperatureChartProps {
  data: Array<{ hour: string; temp: number }>;
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <Card className="p-6 hover-lift animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">
        Temperatura nas últimas 24h
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.8}
              />

              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="hour"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={3}
          />

          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}°`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            formatter={(value: number) => [`${value}°C`, "Temperatura"]}
          />

          <Area
            type="monotone"
            dataKey="temp"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#tempGradient)"
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
