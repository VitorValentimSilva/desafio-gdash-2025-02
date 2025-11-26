import { ArrowUp, ArrowDown } from "lucide-react";

export default function AnimatedTrend({
  trend,
  comfort,
}: {
  trend: number;
  comfort: number;
}) {
  const up = trend > 0.05;
  const down = trend < -0.05;

  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-full bg-white/6">
        {up ? (
          <ArrowUp className="w-5 h-5 text-emerald-400" />
        ) : down ? (
          <ArrowDown className="w-5 h-5 text-rose-400" />
        ) : (
          <ArrowUp className="w-5 h-5 text-slate-400" />
        )}
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Tendência</div>

        <div className="font-semibold">
          {up ? "Subindo" : down ? "Caindo" : "Estável"}
        </div>
      </div>

      <div className="ml-6">
        <div className="text-xs text-muted-foreground">Conforto</div>
        <div className="font-semibold">{comfort}/100</div>
      </div>
    </div>
  );
}
