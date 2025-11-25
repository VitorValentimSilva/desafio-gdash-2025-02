export interface Insight {
  generated_at: string;
  text: string;
  samples: number;
}

interface InsightsPanelProps {
  insight?: Insight;
}

export default function InsightsPanel({ insight }: InsightsPanelProps) {
  if (!insight) return <div>Sem insights</div>;

  return (
    <div>
      <div className="text-sm text-slate-500">Gerado em</div>
      <div className="text-sm mb-2">{insight.generated_at}</div>
      <div className="text-base font-medium mb-2">{insight.text}</div>
      <div className="text-xs text-slate-500">Amostras: {insight.samples}</div>
    </div>
  );
}
