import { weatherCodeToText } from "@/lib/weather";
import { useWeatherLogs } from "@/hooks/useWeatherLogs";
import WeatherTable from "@/components/weather/WeatherTable";
import WeatherHeroCard from "@/components/weather/WeatherHeroCard";
import TemperatureChart from "@/components/weather/TemperatureChart";
import PrecipitationChart from "@/components/weather/PrecipitationChart";
import InsightsPanel from "@/components/insights/InsightsPanel";

const temperatureData = [
  { hour: "00:00", temp: 22 },
  { hour: "01:00", temp: 21 },
  { hour: "02:00", temp: 21 },
  { hour: "03:00", temp: 20 },
  { hour: "04:00", temp: 20 },
  { hour: "05:00", temp: 21 },
  { hour: "06:00", temp: 22 },
  { hour: "07:00", temp: 23 },
  { hour: "08:00", temp: 24 },
  { hour: "09:00", temp: 25 },
  { hour: "10:00", temp: 26 },
  { hour: "11:00", temp: 27 },
  { hour: "12:00", temp: 28 },
  { hour: "13:00", temp: 28 },
  { hour: "14:00", temp: 27 },
  { hour: "15:00", temp: 26 },
  { hour: "16:00", temp: 25 },
  { hour: "17:00", temp: 24 },
  { hour: "18:00", temp: 24 },
  { hour: "19:00", temp: 23 },
  { hour: "20:00", temp: 23 },
  { hour: "21:00", temp: 22 },
  { hour: "22:00", temp: 22 },
  { hour: "23:00", temp: 22 },
];

const precipitationData = [
  60, 55, 50, 48, 45, 50, 58, 65, 70, 75, 80, 85, 80, 78, 70, 60, 55, 50, 45,
  40, 35, 30, 25, 20,
];

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

  const latest = logs[0];

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
            <p className="text-white">Carregando clima...</p>
          )}
        </div>

        <InsightsPanel />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <TemperatureChart data={temperatureData} />
        <PrecipitationChart data={precipitationData} />
      </div>

      <WeatherTable data={tableData} />
    </>
  );
}
