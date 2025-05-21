import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Fetch all users
const fetchUsers = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/users`,
    getAuthConfig()
  );
  return data.users;
};

// Hook to get all users
export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Mutation for approve/disapprove
const approveUser = async ({ id, approve, coordinatorId }) => {
  await axios.patch(
    `${import.meta.env.VITE_API_URL}/users/approve/${id}`,
    { approve, coordinator: coordinatorId },
    getAuthConfig()
  );
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
