// useFetchCourses.js
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import apiClient from "./apiClient";

// Fetch + filter helper
async function fetchAndFilterClasses({ queryKey }) {
  const [, type, user] = queryKey;
  const path =
    user.role === "coordinator" || user.role === "admin"
      ? "/classes/"
      : "/classes/teacher_student";

  const { data } = await apiClient.get(path);
  const now = dayjs();

  // normalize attended IDs
  const attendedIds = Array.isArray(user.attendedClasses)
    ? user.attendedClasses.map((id) => id.toString())
    : [];

  return data.filter((course) => {
    const start = dayjs(course.date);
    const end = start.add(2, "hour");

    // upcoming vs ended
    const isUpcoming = now.isBefore(end);
    const meetsType = type === "upcoming" ? isUpcoming : !isUpcoming;

    // students only see ended classes they attended
    let studentEndedFilter = true;
    if (type === "ended" && user.role === "student") {
      const courseId = course._id.toString();
      studentEndedFilter = attendedIds.includes(courseId);
    }

    // coordinators only see their classes
    const coordFilter =
      user.role === "coordinator"
        ? course.coordinator === user._id ||
          course.coordinator === user._id.toString()
        : true;

    return meetsType && studentEndedFilter && coordFilter;
  });
}

export default function useFetchCourses(type) {
  const user = useSelector((state) => state.user.user);

  const query = useQuery({
    queryKey: ["courses", type, user],
    queryFn: fetchAndFilterClasses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    courses: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
