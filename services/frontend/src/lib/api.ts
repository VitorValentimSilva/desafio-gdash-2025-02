import axios, { AxiosHeaders } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");

  if (token) {
    const headers = new AxiosHeaders(cfg.headers);

    headers.set("Authorization", `Bearer ${token}`);
    cfg.headers = headers;
  }

  return cfg;
});

export default api;
