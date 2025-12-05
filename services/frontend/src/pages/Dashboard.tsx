import { weatherCodeToText } from "@/lib/weather";
import { useWeatherLogs } from "@/hooks/useWeatherLogs";
import { useLast24 } from "@/hooks/useLast24";
import { useWeatherTable } from "@/hooks/useWeatherTable";
import WeatherTable from "@/components/weather/WeatherTable";
import WeatherHeroCard from "@/components/weather/WeatherHeroCard";
import TemperatureChart from "@/components/weather/TemperatureChart";
import PrecipitationChart from "@/components/weather/PrecipitationChart";
import InsightsPanel from "@/components/insights/InsightsPanel";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { logs } = useWeatherLogs();
  const { logsLast24, loading } = useLast24();
  const { data, exportCsv, exportXlsx } = useWeatherTable();
  const { locale } = useLanguage();
  const { t } = useTranslation("weather");

  const latest = logs[0];

  const temperatureData = logsLast24.map((l) => ({
    hour: new Date(l.collected_at).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temp: l.current?.temperature_c ?? 0,
  }));

  const precipitationData: number[] = logsLast24.map((l) =>
    l.current && typeof l.current.precipitation_mm === "number"
      ? l.current.precipitation_mm
      : 0
  );

  return (
    <>
      <div className="grid gap-10 mb-6">
        <div>
          {latest ? (
            <WeatherHeroCard
              city={latest.location.city}
              temperature={`${latest.current.temperature_c}°C`}
              condition={weatherCodeToText(latest.current.weathercode, t)}
              humidity={`${latest.current.relative_humidity_percent ?? "—"}%`}
              wind={`${latest.current.wind_speed_m_s ?? "—"} m/s`}
              pressure={`${latest.current.pressure_msl_hpa ?? "—"} hPa`}
            />
          ) : (
            <p>{t("loadingWeather")}</p>
          )}
        </div>

        <InsightsPanel />
      </div>

      <div>
        {loading ? (
          <p>{t("loadingGraph")}</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <TemperatureChart data={temperatureData} />
            <PrecipitationChart data={precipitationData} />
          </div>
        )}
      </div>

      <WeatherTable
        data={data}
        onExportCsv={exportCsv}
        onExportXlsx={exportXlsx}
      />
    </>
  );
}
