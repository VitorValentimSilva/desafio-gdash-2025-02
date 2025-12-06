import { useCallback, useEffect, useState } from "react";
import { WeatherApi } from "@/services/weatherApi";
import { mapWeatherRecord } from "@/lib/weather";
import type { WeatherLog } from "@/types/weather";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useLanguage } from "./useLanguage";

export function useWeatherTable() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("weather");
  const { locale } = useLanguage();

  const fetchList = useCallback(
    async (page = 1, limit = 20, t: TFunction<"weather">, locale: string) => {
      setLoading(true);
      try {
        const r = await WeatherApi.list(page, limit);
        const { data: records, meta } = r.data;

        setData(
          records.map((rec: WeatherLog) => mapWeatherRecord(rec, t, locale))
        );

        setMeta(meta);
      } catch (err) {
        console.error("Erro ao buscar registros:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const exportCsv = async () => {
    const blob = await WeatherApi.exportCsv();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weather.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportXlsx = async () => {
    const blob = await WeatherApi.exportXlsx();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weather.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchList(1, meta.limit, t, locale);
  }, [fetchList, meta.limit, t, locale]);

  return { data, meta, loading, fetchList, exportCsv, exportXlsx };
}
