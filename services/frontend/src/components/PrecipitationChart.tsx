import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "./ui/card";

interface PrecipitationChartProps {
  data: number[];
}

export default function PrecipitationChart({ data }: PrecipitationChartProps) {
  const chartData = data.map((prob, index) => ({
    hour: `${index.toString().padStart(2, "0")}:00`,
    probability: prob,
  }));

  return (
    <Card className="p-6 hover-lift animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">
        Probabilidade de Chuva (24h)
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="hsl(var(--gradient-primary-end))"
                stopOpacity={0.8}
              />

              <stop
                offset="100%"
                stopColor="hsl(var(--gradient-primary-end))"
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
            tickFormatter={(value) => `${value}%`}
          />

          <ReferenceLine
            y={50}
            stroke="hsl(var(--accent))"
            strokeDasharray="3 3"
            strokeWidth={2}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            formatter={(value: number) => [`${value}%`, "Probabilidade"]}
          />

          <Area
            type="monotone"
            dataKey="probability"
            stroke="hsl(var(--gradient-primary-end))"
            strokeWidth={3}
            fill="url(#rainGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
