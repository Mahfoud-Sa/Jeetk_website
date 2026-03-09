import apiClient from "./apiClient";

export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}

export interface LoginResponse {
  token?: string;
  id: number;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  roles: (string | any)[];
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post("Auth/login", credentials);
};

export const assignRole = async (userId: number, roleId: number): Promise<any> => {
  return apiClient.post("Auth/roles/assign", { userId, roleId });
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
