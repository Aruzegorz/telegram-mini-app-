import axios from "axios";

const API_URL = "http://localhost:8000";

export const createUser = (telegram_id, username) =>
  axios.post(`${API_URL}/users/`, { telegram_id, username });

export const getTasks = (telegram_id, filters = {}) =>
  axios.get(`${API_URL}/tasks/`, { params: { telegram_id, ...filters } });

export const createTask = (telegram_id, task) =>
  axios.post(`${API_URL}/tasks/`, { ...task, telegram_id });

export const updateTask = (telegram_id, task_id, task) =>
  axios.put(`${API_URL}/tasks/${task_id}`, task, { params: { telegram_id } });

export const deleteTask = (telegram_id, task_id) =>
  axios.delete(`${API_URL}/tasks/${task_id}`, { params: { telegram_id } });
