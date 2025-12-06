import axios from "axios";
import { getToken } from "@/lib/tokenStorage";
import { getLocale } from "@/lib/language";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const locale = getLocale();
  if (locale && config.headers) {
    config.headers["Accept-Language"] = locale;
    config.headers["X-Lang"] = locale;
  }

  return config;
});

export default api;
export { axios };
