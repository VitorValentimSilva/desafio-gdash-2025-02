import { Droplets, Gauge, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import AnimatedWeatherIcon from "@/components/weather/AnimatedWeatherIcon";
import { useTranslation } from "react-i18next";

interface WeatherHeroCardProps {
  city: string;
  temperature: string;
  condition: string;
  humidity: string;
  wind: string;
  pressure: string;
}

export default function WeatherHeroCard({
  city,
  temperature,
  condition,
  humidity,
  wind,
  pressure,
}: WeatherHeroCardProps) {
  const { t } = useTranslation("weather");

  return (
    <Card className="relative overflow-hidden p-8 gradient-primary border-0 hover-lift animate-fade-in">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-white/80 text-lg mb-2">{city}</h2>

            <div className="text-7xl font-bold text-white mb-2">
              {temperature}
            </div>

            <p className="text-white/90 text-xl">{condition}</p>
          </div>

          <div className="text-white/90">
            <AnimatedWeatherIcon condition={condition} className="w-24 h-24" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4 hover-lift">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-white/70" />

              <span className="text-white/70 text-sm">{t("humidity")}</span>
            </div>
            <div className="text-white text-xl font-semibold">{humidity}</div>
          </div>

          <div className="glass-panel rounded-xl p-4 hover-lift">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-white/70" />

              <span className="text-white/70 text-sm">{t("wind")}</span>
            </div>
            <div className="text-white text-xl font-semibold">{wind}</div>
          </div>

          <div className="glass-panel rounded-xl p-4 hover-lift">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-white/70" />

              <span className="text-white/70 text-sm">{t("pressure")}</span>
            </div>
            <div className="text-white text-xl font-semibold">{pressure}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
