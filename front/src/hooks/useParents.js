import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./apiClient.js"; // Import apiClient

// Removed API_BASE_URL and getAuthConfig

// Fetch all parents
const fetchParents = async () => {
  // Removed queryParams
  const response = await apiClient.get("/parents"); // Removed params config
  return response.data; // Assuming response.data is the array of parents or an object like { data: [] }
};

export const useGetParents = () => {
  // Removed queryParams
  return useQuery({
    queryKey: ["parents"], // Static queryKey
    queryFn: fetchParents, // Simplified queryFn
    // keepPreviousData removed, add other options like staleTime if needed
  });
};

// Fetch a single parent by ID
const fetchParentById = async (parentId) => {
  const response = await apiClient.get(`/parents/${parentId}`); // Use apiClient, relative URL
  return response.data;
};

export const useGetParentById = (parentId) => {
  return useQuery({
    queryKey: ["parent", parentId],
    queryFn: () => fetchParentById(parentId),
    enabled: !!parentId, // Only run query if parentId is truthy
  });
};

// Create a new parent
const createParent = async (parentData) => {
  const response = await apiClient.post("/parents", parentData); // Use apiClient, relative URL
  return response.data;
};

export const useCreateParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });
};

// Update an existing parent
const updateParent = async ({ parentId, updateData }) => {
  const response = await apiClient.put(`/parents/${parentId}`, updateData); // Use apiClient, relative URL
  return response.data;
};

export const useUpdateParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateParent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({
        queryKey: ["parent", variables.parentId],
      });
    },
  });
};

// Delete a parent
const deleteParent = async (parentId) => {
  const response = await apiClient.delete(`/parents/${parentId}`); // Use apiClient, relative URL
  return response.data;
};

export const useDeleteParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteParent,
    onSuccess: (data, parentId) => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({ queryKey: ["parent", parentId] });
      // Optional: Remove the specific parent from cache if desired, though invalidation often suffices
      // queryClient.removeQueries({ queryKey: ['parent', parentId] });
    },
  });
};

// Add a student to a parent
const addStudentToParent = async ({ parentId, studentId }) => {
  const response = await apiClient.post(`/parents/${parentId}/students`, {
    studentId,
  }); // Use apiClient, relative URL
  return response.data;
};

export const useAddStudentToParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStudentToParent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({
        queryKey: ["parent", variables.parentId],
      });
    },
  });
};

// Remove a student from a parent
const removeStudentFromParent = async ({ parentId, studentId }) => {
  const response = await apiClient.delete(
    `/parents/${parentId}/students/${studentId}`
  ); // Use apiClient, relative URL
  return response.data;
};

export const useRemoveStudentFromParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeStudentFromParent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({
        queryKey: ["parent", variables.parentId],
      });
    },
  });
};
