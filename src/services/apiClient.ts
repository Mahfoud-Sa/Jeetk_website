import axios, { AxiosInstance } from "axios";
import qs from "qs";
import { API_BASE_URL, TIMEOUT } from "./apiConfig";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  paramsSerializer: {
    serialize: (params) =>
      qs.stringify(params, {
        arrayFormat: "brackets",
        skipNulls: true,
        encodeValuesOnly: true,
        filter: (_prefix, value) => {
          if (value === undefined) {
            return;
          }
          return value;
        },
      }),
  },
});

// Add request interceptor to include Authorization header if token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to return data directly as expected by the service functions
let errorCallback: ((message: string) => void) | null = null;
let unauthorizedCallback: (() => void) | null = null;

export const setGlobalErrorHandler = (callback: (message: string) => void) => {
  errorCallback = callback;
};

export const setUnauthorizedHandler = (callback: () => void) => {
  unauthorizedCallback = callback;
};

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (unauthorizedCallback) {
        unauthorizedCallback();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Fallback: reload page to clear state if no callback registered
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    if (errorCallback) {
      errorCallback(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
