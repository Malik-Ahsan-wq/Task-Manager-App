import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3001/api/auth" });

export const register = (data) => api.post("/register", data);
export const login = (data) => api.post("/login", data);
export const getProfile = (token) =>
  api.get("/profile", { headers: { Authorization: `Bearer ${token}` } });
