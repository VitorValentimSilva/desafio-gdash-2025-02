import api from "@/lib/api";
import type { WeatherLog } from "@/types/weather";
import { useCallback, useEffect, useState } from "react";

export function useLast24() {
  const [logsLast24, setLogsLast24] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLast24 = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/weather/last-24");
      console.log("Últimos 24 registros recebidos:", r.data);
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
