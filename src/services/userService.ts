import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { User, CreateUserRequest } from "../types";

export const fetchUsers = async (page = 1, pageSize = 10, sort = 'asc'): Promise<User[]> => {
  try {
    const response = await apiClient.get(`Users`, {
      params: { page, pageSize, sort },
      ...({ skipGlobalError: true } as any)
    });
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
    if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
    return [];
  } catch (error) {
    console.warn("fetchUsers query failed, trying standard fallback without custom parameters...", error);
    try {
      const response = await apiClient.get(`Users`, {
        ...({ skipGlobalError: true } as any)
      });
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
      if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
    } catch (fallbackError) {
      console.warn("fetchUsers fallback standard query also failed:", fallbackError);
    }
    return [];
  }
};

export const fetchUserById = async (id: number): Promise<User> => {
  try {
    return await apiClient.get(`Users/${id}`);
  } catch (error) {
    console.warn(`fetchUserById for ${id} failed:`, error);
    throw error;
  }
};

export function useUsers(page = 1, pageSize = 100, sort = 'asc') {
  return useQuery<User[]>({
    queryKey: ["users", page, pageSize, sort],
    queryFn: () => fetchUsers(page, pageSize, sort),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(id: number | null) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id!),
    enabled: !!id,
  });
}

export const createUser = async (user: CreateUserRequest | Partial<User>): Promise<User> => {
  return apiClient.post(`Users`, user);
};

export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  return apiClient.put(`Users/${id}`, user);
};

export const deleteUser = async (id: number): Promise<void> => {
  return apiClient.delete(`Users/${id}`);
};

export const changePassword = async (confirmedPassword: string, newPassword: string): Promise<any> => {
  return apiClient.post(`Profile/change-password`, { confirmedPassword, newPassword });
};
