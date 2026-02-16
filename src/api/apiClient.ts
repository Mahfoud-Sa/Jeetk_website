import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import qs from "qs";

/**
 * API Error Response type
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Create and configure Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: "https://jeetk-api.runasp.net/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Custom params serializer using qs library
  paramsSerializer: {
    serialize: (params) =>
      qs.stringify(params, {
        arrayFormat: "brackets", // ids[]=1&ids[]=2
        skipNulls: true, // Skip null values
        encodeValuesOnly: true, // Proper URL encoding
        filter: (_prefix, value) => {
          // Skip undefined values
          if (value === undefined) {
            return;
          }
          return value;
        },
      }),
  },
});

/**
 * Request Interceptor
 * - Attaches Authorization header with Bearer token if available
 * - Removes Content-Type header for FormData to let axios set it automatically
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the data is FormData, remove Content-Type header to let axios set it automatically
    // with the correct boundary for multipart/form-data
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * - Returns response.data directly
 * - Handles global API errors
 * - Redirects to login on 401 Unauthorized
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return data directly instead of full response
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const { response } = error;

    if (response) {
      const { status } = response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error("Access forbidden:", response.data?.message);
          break;

        case 404:
          // Not found
          console.error("Resource not found:", response.data?.message);
          break;

        case 422:
          // Validation error - let the caller handle it
          console.error("Validation error:", response.data?.errors);
          break;

        case 500:
          // Server error
          console.error("Server error:", response.data?.message);
          break;

        default:
          console.error("API error:", response.data?.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error - no response received");
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
