import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { WeatherLog } from "@/types/weather";

export function useWeatherLogs(limit = 50) {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);

    try {
      const r = await api.get(`/weather/logs?page=1&limit=${limit}`);

      setLogs(r.data.data ?? []);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, fetchLogs };
}
