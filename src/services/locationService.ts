import { useQuery } from "@tanstack/react-query";
import { Location } from "../types";
import apiClient from "./apiClient";

export const fetchLocations = async (pageNumber = 1, pageSize = 10): Promise<Location[]> => {
  const response = await apiClient.get(`/Locations`, {
    params: { pageNumber, pageSize }
  });
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  // If the API returns the paginated object directly
  if (response && typeof response === 'object' && Array.isArray((response as any).items)) return (response as any).items;
  return [];
};

// Fetch all locations for the origin dropdown
export function useLocations(pageNumber = 1, pageSize = 100) {
  return useQuery<Location[]>({
    queryKey: ["locations", pageNumber, pageSize],
    queryFn: () => fetchLocations(pageNumber, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutation functions for Dashboard
export const createLocation = async (location: Omit<Location, 'id'>): Promise<Location> => {
  return apiClient.post(`/Locations`, location) as unknown as Promise<Location>;
};

export const updateLocation = async (id: string, location: Partial<Location>): Promise<Location> => {
  return apiClient.put(`/Locations/${id}`, location) as unknown as Promise<Location>;
};

export const deleteLocation = async (id: string): Promise<void> => {
  return apiClient.delete(`/Locations/${id}`) as unknown as Promise<void>;
};
