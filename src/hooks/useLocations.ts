import { useQuery } from "@tanstack/react-query";
import { getLocationsPaged } from "../services/locationService";
import { LocationsPagedResponse } from "../types/location";

export function useLocations(pageNumber = 1, pageSize = 10, searchQuery = "") {
  return useQuery<LocationsPagedResponse>({
    queryKey: ["locationsPaged", pageNumber, pageSize, searchQuery],
    queryFn: () => getLocationsPaged(pageNumber, pageSize, searchQuery),
    staleTime: 1000 * 30, // 30 seconds
  });
}
