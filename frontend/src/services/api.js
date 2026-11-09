import axios from 'axios';

/**
 * Centralized Axios instance for communicating with the backend API.
 * Uses environment variable VITE_API_BASE_URL or defaults to localhost.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grandstay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors or format error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clear storage and redirect to login if token is expired/invalid
      // localStorage.removeItem('grandstay_token');
    }
    return Promise.reject(error);
  }
);

export default api;
