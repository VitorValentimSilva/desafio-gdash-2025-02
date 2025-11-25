import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card } from "./ui/card";

interface InsightCardProps {
  text: string;
  type?: "info" | "warning" | "danger";
}

export default function InsightCard({ text, type = "info" }: InsightCardProps) {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-accent" />;
      case "danger":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getBgClass = () => {
    switch (type) {
      case "warning":
        return "bg-accent/10 border-accent/20";
      case "danger":
        return "bg-destructive/10 border-destructive/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  return (
    <Card className={`p-4 ${getBgClass()} hover-lift animate-slide-up`}>
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">{getIcon()}</div>
        <p className="text-sm text-foreground leading-relaxed">{text}</p>
      </div>
    </Card>
  );
}
