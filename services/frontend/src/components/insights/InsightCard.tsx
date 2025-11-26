import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface InsightCardProps {
  text: string;
  type?: "info" | "warning" | "danger";
}

export default function InsightCard({ text, type = "info" }: InsightCardProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "danger":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-sky-400" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-800/10 border-yellow-800/20";
      case "danger":
        return "bg-red-800/10 border-red-800/20";
      default:
        return "bg-sky-800/6 border-sky-800/12";
    }
  };

  return (
    <Card className={`p-4 ${getBgClass()} border rounded-lg shadow-sm`}>
      <div className="flex gap-3 items-start">
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <p className="text-sm text-foreground leading-relaxed">{text}</p>
      </div>
    </Card>
  );
}
