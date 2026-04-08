import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://cal-ai-4d0f.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  getProfile: () => api.get('/auth/profile'),
  updateGoals: (data) => api.put('/auth/goals', data),
};

export const mealsAPI = {
  create: (formData) =>
    api.post('/meals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),
  getByDate: (date) => api.get(`/meals?date=${date}`),
  getAll: () => api.get('/meals'),
  getOne: (id) => api.get(`/meals/${id}`),
  delete: (id) => api.delete(`/meals/${id}`),
};

export const analyticsAPI = {
  daily: (date) => api.get(`/analytics/daily?date=${date}`),
  weekly: (weekOf) => api.get(`/analytics/weekly?weekOf=${weekOf}`),
  monthly: (month, year) => api.get(`/analytics/monthly?month=${month}&year=${year}`),
};

export default api;
