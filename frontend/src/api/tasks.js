import client from "./client";

const headers = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getTasks = (token, params = {}) => client.get("/tasks", { ...headers(token), params });
export const createTask = (token, data) => client.post("/tasks", data, headers(token));
export const updateTask = (token, id, data) => client.put(`/tasks/${id}`, data, headers(token));
export const completeTask = (token, id) => client.patch(`/tasks/${id}/complete`, {}, headers(token));
export const deleteTask = (token, id) => client.delete(`/tasks/${id}`, headers(token));
