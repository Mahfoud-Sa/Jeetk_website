import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLocation } from "../services/locationService";
import { LocationUpdateInput, Location } from "../types/location";

interface UpdateParams {
  id: number;
  data: LocationUpdateInput;
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation<Location, Error, UpdateParams>({
    mutationFn: ({ id, data }) => updateLocation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["locationsPaged"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    }
  });
}
