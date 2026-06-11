import apiClient from "./apiClient";
import { 
  Location, 
  LocationCreateInput, 
  LocationUpdateInput, 
  LocationsPagedResponse, 
  GoogleMapsLinkResponse 
} from "../types/location";

// Fetch Locations with pagination and search
export const getLocationsPaged = async (
  pageNumber = 1, 
  pageSize = 10, 
  searchQuery = ""
): Promise<LocationsPagedResponse> => {
  const response = await apiClient.get("Locations", {
    params: { 
      pageNumber, 
      pageSize,
      name: searchQuery || undefined // support the search by name if provided as parameter
    }
  });

  // Handle various potential backend response structural formats safely
  if (response && (response as any).data && Array.isArray((response as any).data)) {
    return response as unknown as LocationsPagedResponse;
  }

  // Fallback: If it's a plain array returning in preview
  if (Array.isArray(response)) {
    return {
      totalRecords: response.length,
      pageNumber: 1,
      pageSize: response.length || 10,
      totalPages: 1,
      data: response as Location[]
    };
  }

  // Default empty structure
  return {
    totalRecords: 0,
    pageNumber,
    pageSize,
    totalPages: 0,
    data: []
  };
};

// Get a single location by ID
export const getLocationById = async (id: number): Promise<Location> => {
  return apiClient.get(`Locations/${id}`) as unknown as Promise<Location>;
};

// Create a new location
export const createLocation = async (location: LocationCreateInput): Promise<Location> => {
  return apiClient.post("Locations", location) as unknown as Promise<Location>;
};

// Update an existing location
export const updateLocation = async (id: number, location: LocationUpdateInput): Promise<Location> => {
  return apiClient.put(`Locations/${id}`, location) as unknown as Promise<Location>;
};

// Delete a location by ID
export const deleteLocation = async (id: number): Promise<void> => {
  return apiClient.delete(`Locations/${id}`) as unknown as Promise<void>;
};

// Get the Google Maps URL link for a location
export const getGoogleMapsLink = async (id: number): Promise<GoogleMapsLinkResponse> => {
  return apiClient.get(`Locations/${id}/google-maps`) as unknown as Promise<GoogleMapsLinkResponse>;
};

// BACKWARD COMPATIBILITY: Keep old signatures so rest of the app compiles perfectly
export const fetchLocations = async (pageNumber = 1, pageSize = 100): Promise<any[]> => {
  const paged = await getLocationsPaged(pageNumber, pageSize);
  return paged.data.map(loc => ({
    id: String(loc.id),
    name: loc.name,
    address: loc.formattedAddress,
    googleMapsUrl: loc.googleMapsUrl || `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`,
    image: ""
  }));
};

// Backward-compatible query hook used by legacy components
import { useQuery } from "@tanstack/react-query";
export function useLocations(pageNumber = 1, pageSize = 100) {
  return useQuery<any[]>({
    queryKey: ["locations", pageNumber, pageSize],
    queryFn: () => fetchLocations(pageNumber, pageSize),
    staleTime: 1000 * 60 * 5,
  });
}
