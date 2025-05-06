import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Create an axios instance with base URL
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Generic fetch function
const requestApi = async ({
  endpoint,
  method = "get",
  data = null,
  params = null,
  headers = {},
}) => {
  const response = await apiClient.request({
    url: endpoint,
    method,
    data,
    params,
    headers,
  });
  // unwrap nested data if present
  const resData = response.data;
  // if the endpoint key exists in response, return that, else return full data
  return resData[endpoint] !== undefined ? resData[endpoint] : resData;
};

// Hook for GET requests (queries)
const useApiQuery = (key, { endpoint, params, headers }, options) => {
  return useQuery(
    [key, params],
    () => requestApi({ endpoint, params, method: "get", headers }),
    options
  );
};

// Hook for non-GET requests (mutations)
const useApiMutation = ({ endpoint, method = "post", headers }, options) => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload) => requestApi({ endpoint, method, data: payload, headers }),
    {
      onSuccess: () => {
        // Invalidate related queries if provided
        if (options && options.invalidateKeys) {
          options.invalidateKeys.forEach((key) =>
            queryClient.invalidateQueries([key])
          );
        }
        if (options && options.onSuccess) {
          options.onSuccess();
        }
      },
      ...options,
    }
  );
};

export { useApiQuery, useApiMutation, requestApi };
