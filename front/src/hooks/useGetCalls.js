import { useEffect, useState } from "react";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useSelector } from "react-redux";

export const useGetCalls = ({ allUsers = false } = {}) => {
  const { user } = useSelector((state) => state.user);
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCalls = async () => {
      if (!client) return;

      setIsLoading(true);
      // if no user, return empty
      if (!user?._id) {
        setCalls([]);
        setIsLoading(false);
        return;
      }
      // if user is not teacher or coordinator or admin, return empty
      if (
        // !user?.role?.includes("teacher") &&
        !user?.role?.includes("coordinator") &&
        !user?.role?.includes("admin")
      ) {
        setCalls([]);
        setIsLoading(false);
        return;
      }
      try {
        // build filter: always require a start time, then optionally limit by user
        const baseFilter = { starts_at: { $exists: true } };
        const filter_conditions = allUsers
          ? baseFilter
          : {
              ...baseFilter,
              $or: [
                { created_by_user_id: user._id },
                { members: { $in: [user._id] } },
              ],
            };

        const { calls: fetched } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          filter_conditions,
        });
        setCalls(fetched);
      } catch (error) {
        console.error("Error loading calls:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, user?._id, allUsers]);

  const now = new Date();

  const endedCalls = calls.filter(
    ({ state: { startsAt, endedAt } }) =>
      (startsAt && new Date(startsAt) < now) || !!endedAt
  );
  const upcomingCalls = calls.filter(
    ({ state: { startsAt } }) => startsAt && new Date(startsAt) > now
  );

  return { endedCalls, upcomingCalls, callRecordings: calls, isLoading };
};
