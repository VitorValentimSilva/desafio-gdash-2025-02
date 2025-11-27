import { weatherCodeToText } from "@/lib/weather";
import { useWeatherLogs } from "@/hooks/useWeatherLogs";
import WeatherTable from "@/components/weather/WeatherTable";
import WeatherHeroCard from "@/components/weather/WeatherHeroCard";
import TemperatureChart from "@/components/weather/TemperatureChart";
import PrecipitationChart from "@/components/weather/PrecipitationChart";
import InsightsPanel from "@/components/insights/InsightsPanel";
import { useLast24 } from "@/hooks/useLast24";

const tableData = [
  {
    datetime: "2025-11-24 09:00",
    location: "São Paulo",
    condition: "Chuvoso",
    temp: "23°C",
    humidity: "78%",
  },
  {
    datetime: "2025-11-24 06:00",
    location: "São Paulo",
    condition: "Nublado",
    temp: "21°C",
    humidity: "80%",
  },
  {
    datetime: "2025-11-23 18:00",
    location: "São Paulo",
    condition: "Ensolarado",
    temp: "26°C",
    humidity: "60%",
  },
  {
    datetime: "2025-11-23 12:00",
    location: "São Paulo",
    condition: "Ensolarado",
    temp: "28°C",
    humidity: "55%",
  },
  {
    datetime: "2025-11-22 15:00",
    location: "São Paulo",
    condition: "Chuva Forte",
    temp: "22°C",
    humidity: "85%",
  },
  {
    datetime: "2025-11-22 09:00",
    location: "São Paulo",
    condition: "Chuvisco",
    temp: "20°C",
    humidity: "88%",
  },
];

export default function Dashboard() {
  const { logs } = useWeatherLogs();
  const { logsLast24, loading } = useLast24();

  const latest = logs[0];

  const temperatureData = logsLast24.map((l) => ({
    hour: new Date(l.collected_at).toLocaleTimeString("pt-BR", {
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
              condition={weatherCodeToText(latest.current.weathercode)}
              humidity={`${latest.current.relative_humidity_percent ?? "—"}%`}
              wind={`${latest.current.wind_speed_m_s ?? "—"} m/s`}
              pressure={`${latest.current.pressure_msl_hpa ?? "—"} hPa`}
            />
          ) : (
            <p>Carregando clima...</p>
          )}
        </div>

        <InsightsPanel />
      </div>

      <div>
        {loading ? (
          <p>Carregando gráficos...</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <TemperatureChart data={temperatureData} />
            <PrecipitationChart data={precipitationData} />
          </div>
        )}
      </div>

      <WeatherTable data={tableData} />
    </>
  );
}
