import { useQuery } from "@tanstack/react-query";
import { Location, DeliveryRoute } from "../types";
import apiClient from "../apiClient";

export const fetchLocations = async (): Promise<Location[]> => {
  const response = await apiClient.get(`/Locations`);
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  return [];
};

export const fetchDeliveryRoute = async (
  routeId: string | null,
): Promise<DeliveryRoute> => {
  return (await apiClient.get(
    `/DeliveryRoutes/${routeId}`,
  )) as unknown as Promise<DeliveryRoute>;
};

// Fetch all locations for the origin dropdown
export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => fetchLocations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export const fetchDeliveryRoutesByOrigin = async (
  originId: string | null,
): Promise<DeliveryRoute[]> => {
  const response = await apiClient.get(`/DeliveryRoutes/origin/${originId}`);
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray((response as any).data)) return (response as any).data;
  return [];
};

// Fetch delivery route details by origin ID
export function useDeliveryRoute(originId: string | null) {
  return useQuery<DeliveryRoute[]>({
    queryKey: ["deliveryRoutes", originId],
    queryFn: () => fetchDeliveryRoutesByOrigin(originId),
    enabled: !!originId,
  });
}

// Keep old hook for backward compatibility
export function useRouteDetails(routeId: string | null) {
  return useDeliveryRoute(routeId);
}
