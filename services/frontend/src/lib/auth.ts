import api from "./api";

export const login = async (email: string, password: string) => {
  const r = await api.post("/auth/login", { email, password });
  const token = r.data?.access_token;
  if (token) localStorage.setItem("token", token);
  return r.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => localStorage.getItem("token");
