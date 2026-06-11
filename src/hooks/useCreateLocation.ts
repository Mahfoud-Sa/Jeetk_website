import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocation } from "../services/locationService";
import { LocationCreateInput, Location } from "../types/location";

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, LocationCreateInput>({
    mutationFn: (newLocation) => createLocation(newLocation),
    onSuccess: () => {
      // Invalidate current queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ["locationsPaged"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    }
  });
}
