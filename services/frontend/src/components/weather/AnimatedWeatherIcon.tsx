import { Cloud, CloudRain, Sun, Zap } from "lucide-react";
import { weatherCodeToCategory } from "@/lib/weather";

interface AnimatedWeatherIconProps {
  condition: number | string;
  className?: string;
}

export default function AnimatedWeatherIcon({
  condition,
  className = "",
}: AnimatedWeatherIconProps) {
  const category =
    typeof condition === "number"
      ? weatherCodeToCategory(condition)
      : weatherCodeToCategory(Number(condition) || -1);

  if (category === "rain" || category === "drizzle") {
    return (
      <div className={`relative ${className}`} aria-hidden>
        <CloudRain
          className="w-full h-full text-white/95 drop-shadow-md"
          strokeWidth={1.6}
        />

        <div className="absolute inset-0 pointer-events-none">
          <span
            className="absolute left-1/4 top-3/4 w-px h-4 rounded bg-white/80 animate-rain-drop"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="absolute left-2/4 top-3/4 w-px h-4 rounded bg-white/70 animate-rain-drop"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="absolute left-3/4 top-3/4 w-px h-4 rounded bg-white/60 animate-rain-drop"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    );
  }

  if (category === "sun") {
    return (
      <div className={`relative ${className}`} aria-hidden>
        <Sun
          className="w-full h-full text-yellow-300 drop-shadow-lg"
          strokeWidth={1.6}
        />
      </div>
    );
  }

  if (category === "snow") {
    return (
      <div className={`relative ${className}`} aria-hidden>
        <Cloud className="w-full h-full text-white/90" strokeWidth={1.6} />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-3/4 text-white/90 animate-snowflake">
            ❄
          </div>
          <div
            className="absolute left-1/2 top-3/4 text-white/80 animate-snowflake"
            style={{ animationDelay: "0.2s" }}
          >
            ❄
          </div>
          <div
            className="absolute left-2/3 top-3/4 text-white/70 animate-snowflake"
            style={{ animationDelay: "0.4s" }}
          >
            ❄
          </div>
        </div>
      </div>
    );
  }

  if (category === "thunder") {
    return (
      <div className={`relative ${className}`} aria-hidden>
        <Cloud className="w-full h-full text-white/90" strokeWidth={1.6} />

        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-8 h-12 text-yellow-200 drop-shadow-xl animate-flash" />
        </div>
      </div>
    );
  }

  if (category === "fog") {
    return (
      <div className={`relative ${className}`} aria-hidden>
        <Cloud className="w-full h-full text-white/85" strokeWidth={1.6} />

        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent blur-sm" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} aria-hidden>
      <Cloud
        className="w-full h-full text-white/90 animate-cloud-float"
        strokeWidth={1.6}
      />
    </div>
  );
}
