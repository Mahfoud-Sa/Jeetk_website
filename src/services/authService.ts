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
  isEmailVerified?: boolean;
  isAccountVerified?: boolean;
  roles: (string | any)[];
}

export interface DeliveryRegisterRequest {
  name: string;
  birthDate: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  username: string;
  phoneNumbers: {
    number: string;
    type: string;
  }[];
}

export const registerDelivery = async (data: DeliveryRegisterRequest): Promise<any> => {
  return apiClient.post("Auth/register/delivery", data);
};

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post("Auth/login", credentials);
};

export const forgotPassword = async (email: string): Promise<any> => {
  return apiClient.post("Auth/forgot-password", { email });
};

export const resetPassword = async (email: string, token: string, newPassword: string): Promise<any> => {
  return apiClient.post(
    "Auth/change-password", 
    { confirmedPassword: newPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
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

export enum OtpChannel {
  Email = 0,
  Sms = 1,
  WhatsApp = 2,
  Voice = 3,
}

export interface OtpRequest {
  destination: string;
  channel: OtpChannel;
}

export interface OtpVerifyRequest {
  destination: string;
  code: string;
  channel: OtpChannel;
}

export const sendOtp = async (data: OtpRequest): Promise<any> => {
  return apiClient.post("Auth/send", data);
};

export const verifyOtp = async (data: OtpVerifyRequest): Promise<any> => {
  return apiClient.post("Auth/verify", data);
};

export const verifyEmail = async (email: string, code: string): Promise<any> => {
  return verifyOtp({ destination: email, code, channel: OtpChannel.Email });
};

export const sendEmailCode = async (email: string): Promise<any> => {
  return sendOtp({ destination: email, channel: OtpChannel.Email });
};
