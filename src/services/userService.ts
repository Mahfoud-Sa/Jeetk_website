import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { User, CreateUserRequest } from "../types";

export const fetchUsers = async (page = 1, pageSize = 10, sort = 'asc'): Promise<User[]> => {
  const response = await apiClient.get(`Users`, {
    params: { page, pageSize, sort }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export const fetchUserById = async (id: number): Promise<User> => {
  return apiClient.get(`Users/${id}`);
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
