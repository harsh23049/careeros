/**
 * CareerOS API Client
 * Configured Axios instance with in-memory token management, baseURL fallback,
 * credentials support, and automatic refresh interceptor.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

let inMemoryAccessToken = null;
let onAuthFailureCallback = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAccessToken = () => inMemoryAccessToken;

export const setOnAuthFailure = (callback) => {
  onAuthFailureCallback = callback;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach in-memory access token if present
apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 with queued token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth entrypoints or already retried requests
    const isAuthRoute =
      originalRequest?.url?.includes('/users/login') ||
      originalRequest?.url?.includes('/users/refresh-access-token') ||
      originalRequest?.url?.includes('/users/register') ||
      originalRequest?.url?.includes('/users/forgot-password') ||
      originalRequest?.url?.includes('/users/reset-password');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/users/refresh-access-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        setAccessToken(newAccessToken);

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);

        if (typeof onAuthFailureCallback === 'function') {
          onAuthFailureCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
