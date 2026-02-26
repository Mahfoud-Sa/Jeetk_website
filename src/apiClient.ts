import axios, { AxiosInstance } from "axios";
import qs from "qs";

const apiClient: AxiosInstance = axios.create({
  baseURL: "https://jeetk-api.runasp.net/api",
  timeout: 30000,
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

// Add interceptor to return data directly as expected by the service functions
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default apiClient;
