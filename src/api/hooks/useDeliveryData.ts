import { useQuery } from "@tanstack/react-query";
import { Location, DeliveryRoute } from "@/types/delivery";
import apiClient from "../apiClient";

export const locations = async (): Promise<Location[]> => {
  return apiClient.get(`/Locations`) as unknown as Promise<Location[]>;
};

export const deliveryRoute = async (
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
    queryFn: () => locations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export const deliveryRoutesByOrigin = async (
  originId: string | null,
): Promise<DeliveryRoute[]> => {
  return (await apiClient.get(
    `/DeliveryRoutes/origin/${originId}`,
  )) as unknown as Promise<DeliveryRoute[]>;
};

// Fetch delivery route details by origin ID
export function useDeliveryRoute(originId: string | null) {
  console.log("originId", originId);
  return useQuery<DeliveryRoute[]>({
    queryKey: ["deliveryRoutes", originId],
    queryFn: () => deliveryRoutesByOrigin(originId),
    enabled: !!originId,
  });
}

// Keep old hook for backward compatibility
export function useRouteDetails(routeId: string | null) {
  return useDeliveryRoute(routeId);
}
