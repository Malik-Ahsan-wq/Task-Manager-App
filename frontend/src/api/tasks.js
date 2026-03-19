import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3001/api/tasks" });

const headers = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getTasks = (token, params = {}) => api.get("/", { ...headers(token), params });
export const createTask = (token, data) => api.post("/", data, headers(token));
export const updateTask = (token, id, data) => api.put(`/${id}`, data, headers(token));
export const completeTask = (token, id) => api.patch(`/${id}/complete`, {}, headers(token));
export const deleteTask = (token, id) => api.delete(`/${id}`, headers(token));
