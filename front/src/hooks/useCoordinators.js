import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";

// Custom hook for fetching all coordinators
export const useCoordinators = () => {
  return useQuery({
    queryKey: ["coordinators"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/coordinators");
      return data.data.coordinators;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
