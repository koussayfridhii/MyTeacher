import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";
import { useSelector } from "react-redux";

async function fetchPlansAPI({ queryKey }) {
  // queryKey might include other parameters in the future if needed
  // const [_, userToken] = queryKey; // Example if token needed directly by API call and not through interceptor

  // apiClient already has an interceptor for the token
  const { data } = await apiClient.get("/plans");
  if (data.success) {
    return data.plans;
  }
  // Handle cases where data.success is false or plans array is not present
  // This might depend on how your API structures error responses for GET requests
  // For now, assuming successful GETs always have data.plans if data.success is true
  // And errors are handled by react-query's error state based on HTTP status codes
  return data.plans || []; // return empty array if plans not found but request was "successful" in some way
}

export const useFetchPlans = () => {
  const token = useSelector((state) => state.user?.token); // To ensure query re-runs if user changes, though token itself is handled by interceptor

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["plans", token], // Token included in queryKey to refetch if it changes
    queryFn: fetchPlansAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!token, // Only run query if token exists
  });

  return {
    plans: plans || [],
    isLoading,
    error,
  };
};
