import { useQuery } from "@tanstack/react-query"
import { Location, DeliveryRoute } from "@/types/delivery"

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

// Fetch all locations for the origin dropdown
export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const data = await fetchWithProxy<Location[] | { value: Location[] }>(`${API_BASE}/Locations`)
        const locations = Array.isArray(data) ? data : (data.value || [])
        return locations.length > 0 ? locations : fallbackLocations
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
