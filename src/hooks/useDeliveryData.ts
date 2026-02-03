import { useQuery } from "@tanstack/react-query"
import { Location, DeliveryRoute, RouteLocation } from "@/types/delivery"

const API_BASE = "http://jeetk-api.runasp.net/api"

const fetchWithProxy = async <T>(url: string): Promise<T> => {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  const response = await fetch(proxyUrl)
  if (!response.ok) throw new Error("Proxy error: " + response.statusText)
  const data = await response.json()
  return JSON.parse(data.contents)
}

const fallbackLocations: Location[] = [
  { id: 1, name: "موقع افتراضي 1 (تجريبي)", routeLocations: [{ deliveryRouteId: 101, name: "طريق 1" }, { deliveryRouteId: 102, name: "طريق 2" }] },
  { id: 2, name: "موقع افتراضي 2 (تجريبي)", routeLocations: [{ deliveryRouteId: 103, name: "طريق 3" }] }
]

const normalizeRouteLocation = (routeLocation: any): RouteLocation => {
  const deliveryRoute = routeLocation.deliveryRoute ?? routeLocation.DeliveryRoute
  return {
    id: routeLocation.id ?? routeLocation.Id,
    deliveryRouteId:
      routeLocation.deliveryRouteId ??
      routeLocation.DeliveryRouteId ??
      routeLocation.routeId ??
      routeLocation.RouteId ??
      deliveryRoute?.id ??
      deliveryRoute?.Id ??
      0,
    name: routeLocation.name ?? routeLocation.Name ?? deliveryRoute?.name ?? deliveryRoute?.Name,
    deliveryRoute: deliveryRoute
      ? {
          id: deliveryRoute.id ?? deliveryRoute.Id,
          name: deliveryRoute.name ?? deliveryRoute.Name,
          deliveryPrice: deliveryRoute.deliveryPrice ?? deliveryRoute.DeliveryPrice,
        }
      : undefined,
  }
}

const normalizeLocation = (location: any): Location => {
  const rawRoutes =
    location.routeLocations ??
    location.RouteLocations ??
    location.deliveryRoutes ??
    location.DeliveryRoutes ??
    []

  return {
    id: location.id ?? location.Id ?? location.locationId ?? location.LocationId,
    name: location.name ?? location.Name,
    routeLocations: Array.isArray(rawRoutes) ? rawRoutes.map(normalizeRouteLocation) : [],
  }
}

// Fetch all locations for the origin dropdown
export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const data = await fetchWithProxy<Location[] | { value: Location[] }>(`${API_BASE}/Locations`)
        const locations = Array.isArray(data) ? data : (data.value || [])
        const normalizedLocations = locations.map(normalizeLocation)
        return normalizedLocations.length > 0 ? normalizedLocations : fallbackLocations
      } catch {
        console.warn("Using fallback locations")
        return fallbackLocations
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Fetch delivery route details by ID - returns locations for destination dropdown
export function useDeliveryRoute(routeId: string | null) {
  return useQuery<DeliveryRoute>({
    queryKey: ["deliveryRoute", routeId],
    queryFn: () => fetchWithProxy<DeliveryRoute>(`${API_BASE}/DeliveryRoutes/${routeId}`),
    enabled: !!routeId,
  })
}

// Keep old hook for backward compatibility
export function useRouteDetails(routeId: string | null) {
  return useDeliveryRoute(routeId)
}
