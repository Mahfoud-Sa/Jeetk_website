import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLocation } from "../services/locationService";

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locationsPaged"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    }
  });
}
