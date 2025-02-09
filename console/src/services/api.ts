import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // Replace with your actual API URL

// Create a separate axios instance for refresh token requests
const refreshApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to track if a token refresh is in progress
let isRefreshing = false;
// Store pending requests that are waiting for the token refresh
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add callbacks to the subscriber list
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers with the new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Function to handle logout
const handleLogout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or the request is already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If token refresh is in progress, add request to queue
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const deviceUuid = localStorage.getItem('deviceUuid');
      // Use the separate axios instance for refresh token request
      const response = await refreshApi.post('/auth/refreshToken', { deviceUuid });
      const { accessToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      
      // Notify all subscribers about the new token
      onRefreshed(accessToken);
      
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh token request fails, logout user
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
); 