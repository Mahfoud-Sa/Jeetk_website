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
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default apiClient;
