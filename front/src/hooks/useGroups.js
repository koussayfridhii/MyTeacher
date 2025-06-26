import { useState, useCallback } from "react";
import apiClient from "./apiClient"; // Assuming you have a preconfigured axios instance
import { useSelector } from "react-redux";

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.user?.token);

  const buildAuthHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/groups", {
        headers: buildAuthHeaders(),
      });
      setGroups(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Failed to fetch groups:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [buildAuthHeaders]);

  const fetchGroupById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/groups/${id}`, {
          headers: buildAuthHeaders(),
        });
        setGroup(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error(`Failed to fetch group ${id}:`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [buildAuthHeaders]
  );

  const createGroup = useCallback(
    async (groupData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/groups", groupData, {
          headers: buildAuthHeaders(),
        });
        // Optionally, refetch groups or add to local state
        fetchGroups(); // Re-fetch to update the list
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error("Failed to create group:", err);
        throw err; // Re-throw to allow form error handling
      } finally {
        setLoading(false);
      }
    },
    [buildAuthHeaders, fetchGroups]
  );

  const updateGroup = useCallback(
    async (id, updateData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.patch(`/groups/${id}`, updateData, {
          headers: buildAuthHeaders(),
        });
        // Optionally, refetch groups or update local state
        fetchGroups(); // Re-fetch to update the list
        if (group && group._id === id) { // if current detail view is for this group
          setGroup(response.data);
        }
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error(`Failed to update group ${id}:`, err);
        throw err; // Re-throw to allow form error handling
      } finally {
        setLoading(false);
      }
    },
    [buildAuthHeaders, fetchGroups, group]
  );

  const deleteGroup = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/groups/${id}`, {
          headers: buildAuthHeaders(),
        });
        // Optionally, refetch groups or remove from local state
        fetchGroups(); // Re-fetch to update the list
        return true;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error(`Failed to delete group ${id}:`, err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [buildAuthHeaders, fetchGroups]
  );

  const addStudentToGroup = useCallback(
    async (groupId, studentId) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.patch(`/groups/${groupId}`, { studentId }, {
          headers: buildAuthHeaders(),
        });
        fetchGroups(); // Re-fetch to update the list
         if (group && group._id === groupId) { // if current detail view is for this group
          setGroup(response.data); // Update the single group view if it's the one being modified
        }
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        console.error(`Failed to add student to group ${groupId}:`, err);
        throw err; // Re-throw to allow form error handling
      } finally {
        setLoading(false);
      }
    },
    [buildAuthHeaders, fetchGroups, group]
  );

  return {
    groups,
    group,
    loading,
    error,
    fetchGroups,
    fetchGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    addStudentToGroup,
    setGroup // allow manually setting group for detail views if needed
  };
};
