import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { ActionEntity } from "../types";

export const fetchActions = async (page = 1, pageSize = 100): Promise<ActionEntity[]> => {
  const response = await apiClient.get(`Actions`, {
    params: { page, pageSize }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

export function useActions(page = 1, pageSize = 100) {
  return useQuery<ActionEntity[]>({
    queryKey: ["actions", page, pageSize],
    queryFn: () => fetchActions(page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
