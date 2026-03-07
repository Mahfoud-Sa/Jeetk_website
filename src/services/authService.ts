import apiClient from "./apiClient";

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

export interface LoginResponse {
  token?: string;
  user?: any;
  // Add other fields based on actual API response
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post("/Auth/login", credentials);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};
