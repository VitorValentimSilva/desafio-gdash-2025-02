import { useCallback, useEffect, useState } from "react";
import { WeatherApi } from "@/services/weatherApi";
import { mapWeatherRecord } from "@/mappers/mapWeatherRecord";

export function useWeatherTable() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const r = await WeatherApi.list(page, limit);
      const { data: records, meta } = r.data;

      setData(records.map(mapWeatherRecord));
      setMeta(meta);
    } catch (err) {
      console.error("Erro ao buscar registros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchList(1, meta.limit);
  }, [fetchList, meta.limit]);

  return { data, meta, loading, fetchList, exportCsv, exportXlsx };
}
