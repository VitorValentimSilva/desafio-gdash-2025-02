import { useEffect, useState } from "react";
import api from "../lib/api";
import WeatherCard from "@/components/WeatherCard";
import WeatherChart from "@/components/WeatherChart";
import InsightsPanel, { type Insight } from "@/components/InsightsPanel";
import WeatherTable from "@/components/WeatherTable";

interface WeatherLog {
  collected_at: string;
  current?: {
    temperature_c?: number;
    relative_humidity_percent?: number;
    wind_speed_m_s?: number;
    weathercode?: string | number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insight, setInsight] = useState<Insight>();
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await api.get("/weather/logs?page=1&limit=50");
      setLogs(r.data.data ?? []);
      const i = await api.get("/weather/insights?period=24");
      setInsight(i.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const latest = logs[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WeatherCard
          title="Temperatura"
          value={latest?.current?.temperature_c ?? "—"}
          unit="°C"
        />
        <WeatherCard
          title="Umidade"
          value={latest?.current?.relative_humidity_percent ?? "—"}
          unit="%"
        />
        <WeatherCard
          title="Vento"
          value={latest?.current?.wind_speed_m_s ?? "—"}
          unit="m/s"
        />
        <WeatherCard
          title="Condição"
          value={latest?.current?.weathercode ?? "—"}
          unit={""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="text-lg mb-2">Temperatura (últimos registros)</h3>
          <WeatherChart
            data={logs
              .filter((l) => typeof l.current?.temperature_c === "number")
              .map((l) => ({
                time: l.collected_at,
                temp: l.current!.temperature_c as number,
              }))}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_API_URL}/weather/export.csv`,
                  "_blank`"
                )
              }
              className="px-3 py-1 bg-slate-200 rounded"
            >
              Export CSV
            </button>
            <button
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_API_URL}/weather/export.xlsx`,
                  "_blank`"
                )
              }
              className="px-3 py-1 bg-slate-200 rounded"
            >
              Export XLSX
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg mb-2">Insights</h3>
          <InsightsPanel insight={insight} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg mb-2">Registros</h3>
        <WeatherTable
          rows={logs.map((log) => ({
            id: log.collected_at,
            collected_at: log.collected_at,
            location:
              typeof log.location === "object" && log.location !== null && "city" in log.location
                ? { city: (log.location as { city?: string }).city }
                : undefined,
            current: log.current,
          }))}
          loading={loading}
        />
      </div>
    </div>
  );
}
