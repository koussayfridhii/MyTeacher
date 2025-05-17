// useFetchAvailabilities.js
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient"; // axios instance

// fetch availabilities based on role
async function fetchAvailabilities({ queryKey }) {
  const [, userRole] = queryKey;
  const path =
    userRole === "admin" || userRole === "coordinator"
      ? "/availability/"
      : "/availability/me";

  const { data } = await apiClient.get(path);
  return data;
}

export default function useFetchAvailabilities() {
  const user = useSelector((state) => state.user.user);
  const userRole = user?.role;
  const queryKey = ["availabilities", userRole];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchAvailabilities,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    availabilities: data || [],
    isLoading,
    error,
  };
}
