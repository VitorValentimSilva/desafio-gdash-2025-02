import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { Insight } from "@/types/insight";

export function useInsights(period = 24) {
  const [insight, setInsight] = useState<Insight>();
  const [loading, setLoading] = useState(false);

  const fetchInsight = useCallback(async () => {
    setLoading(true);

    try {
      const r = await api.get(`/weather/insights?period=${period}`);

      setInsight(r.data);
    } catch (err) {
      console.error("Erro ao buscar insights:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return { insight, loading, fetchInsight };
}
