import client from "./client";

export const register = (data) => client.post("/auth/register", data);
export const login = (data) => client.post("/auth/login", data);
export const getProfile = (token) =>
  client.get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
