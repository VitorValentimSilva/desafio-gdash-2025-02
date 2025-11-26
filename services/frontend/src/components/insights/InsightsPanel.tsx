import { Card } from "@/components/ui/card";
import { useWeatherLogs } from "@/hooks/useWeatherLogs";
import { useInsights } from "@/hooks/useInsights";
import { useComputedInsights } from "@/hooks/useComputedInsights";
import InsightsChart from "@/components/insights/InsightsChart";
import InsightCard from "@/components/insights/InsightCard";
import AnimatedTrend from "@/components/insights/AnimatedTrend";

export default function InsightsPanel() {
  const { logs, fetchLogs, loading: logsLoading } = useWeatherLogs(48);
  const { insight, fetchInsight, loading: insightLoading } = useInsights(24);
  const computed = useComputedInsights(logs);
  const latest = logs?.[0];

  async function handleRefresh() {
    await Promise.all([fetchLogs(), fetchInsight()]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insights</h3>

        <div className="flex items-center gap-4">
          <AnimatedTrend
            trend={(computed?.trend as number) ?? 0}
            comfort={(computed?.comfort_score as number) ?? 50}
          />

          <button
            onClick={handleRefresh}
            disabled={logsLoading || insightLoading}
            className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            aria-disabled={logsLoading || insightLoading}
          >
            {logsLoading || insightLoading
              ? "Atualizando..."
              : "Atualizar insights"}
          </button>
        </div>
      </div>

      <Card className="p-4">
        <InsightsChart logs={logs ?? []} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-2">Resumo</div>

          <div className="text-base font-medium">
            {typeof insight?.summary === "string"
              ? insight.summary
              : typeof insight?.text === "string"
              ? insight.text
              : "Sem dados suficientes"}
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {(insight?.alerts ?? []).map((a: string, i: number) => (
              <InsightCard
                key={i}
                text={a}
                type={
                  a.toLowerCase().includes("chuva")
                    ? "warning"
                    : a.toLowerCase().includes("calor")
                    ? "danger"
                    : "info"
                }
              />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Último registro</div>

          {latest ? (
            <>
              <div className="text-lg font-semibold">
                {latest.location?.city ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(latest.collected_at).toLocaleString()}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  Temp:{" "}
                  <strong>{latest.current?.temperature_c ?? "—"}°C</strong>
                </div>
                <div>
                  Umid:{" "}
                  <strong>
                    {latest.current?.relative_humidity_percent ?? "—"}%
                  </strong>
                </div>
                <div>
                  Vento:{" "}
                  <strong>{latest.current?.wind_speed_m_s ?? "—"} m/s</strong>
                </div>
                <div>
                  Pressão:{" "}
                  <strong>{latest.current?.pressure_msl_hpa ?? "—"} hPa</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm">Sem dados</div>
          )}
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Classificação</div>

          <div className="text-lg font-semibold">
            {computed?.classification ?? "—"}
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            Conforto: <strong>{computed?.comfort_score ?? "—"}/100</strong>
          </div>
        </Card>
      </div>
    </div>
  );
}
