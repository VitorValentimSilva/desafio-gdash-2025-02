import { Cloud, CloudRain, Sun } from "lucide-react";

interface AnimatedWeatherIconProps {
  condition: string;
  className?: string;
}

export default function AnimatedWeatherIcon({
  condition,
  className = "",
}: AnimatedWeatherIconProps) {
  const normalizedCondition = condition.toLowerCase();

  if (
    normalizedCondition.includes("chuv") ||
    normalizedCondition.includes("rain")
  ) {
    return (
      <div className={`relative ${className}`}>
        <CloudRain
          className="w-full h-full text-white/90 animate-pulse-glow"
          strokeWidth={1.5}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/4 w-0.5 h-2 bg-white/60 rounded-full animate-rain-drop"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-white/60 rounded-full animate-rain-drop"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="absolute top-1/2 left-3/4 w-0.5 h-2 bg-white/60 rounded-full animate-rain-drop"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>
    );
  }

  if (
    normalizedCondition.includes("ensolarado") ||
    normalizedCondition.includes("sun") ||
    normalizedCondition.includes("clear")
  ) {
    return (
      <div className={`relative ${className}`}>
        <Sun
          className="w-full h-full text-white/90 animate-sun-pulse"
          strokeWidth={1.5}
        />
        <div className="absolute inset-0 animate-sun-rotate">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-3 bg-white/30 rounded-full"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-${
                    className.includes("24") ? "16" : "10"
                  }px)`,
                  transformOrigin: "center center",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Cloud
        className="w-full h-full text-white/90 animate-cloud-float"
        strokeWidth={1.5}
      />

      <div className="absolute top-1/4 -right-2 opacity-50">
        <Cloud
          className="w-1/2 h-1/2 text-white/60 animate-cloud-drift"
          strokeWidth={1.5}
        />
      </div>
    </div>
  );
}
