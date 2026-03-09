import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { User } from "../types";

export const fetchUsers = async (pageNumber = 1, pageSize = 10): Promise<User[]> => {
  const response = await apiClient.get(`Users`, {
    params: { pageNumber, pageSize }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export const fetchUserById = async (id: number): Promise<User> => {
  return apiClient.get(`Users/${id}`);
};

export function useUsers(pageNumber = 1, pageSize = 100) {
  return useQuery<User[]>({
    queryKey: ["users", pageNumber, pageSize],
    queryFn: () => fetchUsers(pageNumber, pageSize),
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

export const createUser = async (user: Partial<User>): Promise<User> => {
  return apiClient.post(`Users`, user);
};

export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  return apiClient.put(`Users/${id}`, user);
};

export const deleteUser = async (id: number): Promise<void> => {
  return apiClient.delete(`Users/${id}`);
};
