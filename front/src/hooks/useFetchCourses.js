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
  return data.filter((course) => {
    const start = dayjs(course.date);
    const end = start.add(2, "hour");

    // classify by type
    const isUpcoming = now.isBefore(start);
    const isOngoing = now.isAfter(start) && now.isBefore(end);
    const isEnded = now.isAfter(end);

    let meetsType;
    if (type === "upcoming") {
      meetsType = isUpcoming;
    } else if (type === "now") {
      meetsType = isOngoing;
    } else {
      meetsType = isEnded;
    }

    // students only see ended classes they attended or were enrolled in
    const studentFilter =
      type === "ended" && user.role === "student"
        ? user.attendedClasses.includes(course._id) ||
          course.students.includes(user._id)
        : true;

    // coordinators only see their own classes
    const coordFilter =
      user.role === "coordinator" ? course.coordinator?._id === user._id : true;

    return meetsType && studentFilter && coordFilter;
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
