import { useCallback, useEffect, useState } from "react";
import type { WeatherLog } from "@/types/weather";
import api from "@/services/api";

export function useLast24() {
  const [logsLast24, setLogsLast24] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLast24 = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/weather/last-24");
      setLogsLast24(r.data ?? []);
    } catch (err) {
      console.error("Erro ao buscar últimos 24 registros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLast24();
  }, [fetchLast24]);

  return { logsLast24, loading, refetch: fetchLast24 };
}
