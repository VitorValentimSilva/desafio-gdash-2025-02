import { useCallback, useEffect, useState } from "react";
import type { Insight } from "@/types/insight";
import api from "@/services/api";

export function useInsights(period = 24, locale?: string) {
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
  }, [fetchInsight, locale]);

  return { insight, loading, fetchInsight };
}
