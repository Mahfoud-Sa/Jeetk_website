import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { ActionEntity } from "../types";

export const fetchActions = async (page = 1, pageSize = 100, userId?: number | null): Promise<ActionEntity[]> => {
  const params: any = { page, pageSize };
  if (userId) {
    params.userId = userId;
  }
  const response = await apiClient.get(`Actions`, {
    params
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export function useActions(page = 1, pageSize = 100, userId?: number | null) {
  return useQuery<ActionEntity[]>({
    queryKey: ["actions", page, pageSize, userId],
    queryFn: () => fetchActions(page, pageSize, userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
