import api from "@/lib/api";

export const WeatherApi = {
  list: (page: number, limit: number) =>
    api.get(`/weather/logs?page=${page}&limit=${limit}`),

  exportCsv: async () => {
    const r = await api.get("/weather/export.csv", {
      responseType: "blob",
    });
    return r.data;
  },

  exportXlsx: async () => {
    const r = await api.get("/weather/export.xlsx", {
      responseType: "blob",
    });
    return r.data;
  },
};
