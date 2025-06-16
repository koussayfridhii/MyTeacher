/* eslint-disable no-unused-vars */
"use strict";
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  Input,
  Button,
  Tooltip,
  ButtonGroup,
  Flex,
} from "@chakra-ui/react";
import { useGetCalls } from "../hooks/useGetCalls";
import { useSelector } from "react-redux";
import axios from "axios";

const allowedToFetchAllCalls = ["admin", "coordinator"];

const RecordingsList = ({ type }) => {
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 36; // adjust as needed

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { callRecordings, isLoading } = useGetCalls({
    allUsers: allowedToFetchAllCalls.includes(user?.role),
  });

  const coursesCache = useRef(null);

  const fetchCourses = useCallback(async () => {
    if (coursesCache.current) {
      return coursesCache.current;
    }
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/classes/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    coursesCache.current = data;
    setCourses(data);
    return data;
  }, []);

  const fetchRecordings = useCallback(async () => {
    if (!Array.isArray(callRecordings) || callRecordings.length === 0) {
      return setItems([]);
    }

    const coursesData = courses.length ? courses : await fetchCourses();
    const filteredCalls = callRecordings.filter((call) =>
      coursesData.some((course) => course.meetID === call.id)
    );

    const results = await Promise.allSettled(
      filteredCalls.map((m) => m.queryRecordings())
    );

    const recs = results
      .filter(
        (r) => r.status === "fulfilled" && Array.isArray(r.value.recordings)
      )
      .flatMap((r) => r.value.recordings);

    const merged = recs.map((rec) => {
      const course = coursesData.find((c) => rec.filename.includes(c.meetID));
      return {
        ...rec,
        teacherName: `${course?.teacher.firstName} ${course?.teacher.lastName}`,
        totalStudents: course?.students?.length || 0,
        presentStudents: course?.presentStudents?.length || 0,
        presentStudentsNames: course?.presentStudents || [],
        title: course?.topic ?? "-",
        coordinator: course.coordinator || null,
        url: rec.url || rec.filename,
      };
    });
    const visibleRecs =
      user.role === "admin"
        ? merged
        : merged.filter((rec) => rec.coordinator._id === user._id);

    setItems(visibleRecs);
  }, [callRecordings, courses, fetchCourses, user._id]);

  useEffect(() => {
    if (type === "recordings") {
      fetchRecordings();
    } else if (type === "upcoming" || type === "ended") {
      fetchCourses().then((allCourses) => {
        const now = Date.now();
        const filtered = allCourses.filter((course) => {
          const courseTime = new Date(course.date).getTime();
          return type === "upcoming" ? courseTime > now : courseTime < now;
        });
        setItems(filtered);
      });
    }
  }, [type, fetchCourses, fetchRecordings]);

  const handlePlay = (meeting) => {
    const id = meeting.session_id || meeting._id;
    navigate(`/dashboard/meeting/recordings/${id}`, {
      state: { link: meeting.url },
    });
  };

  // Memoized and filtered/sorted items
  const displayedItems = useMemo(() => {
    let list = items;
    if (type === "recordings") {
      list = items
        .filter((item) => {
          const val = searchQuery.toLowerCase();
          return (
            (item.title?.toLowerCase() || "").includes(val) ||
            (item.teacherName?.toLowerCase() || "").includes(val)
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.state?.startsAt || a.start_time);
          const dateB = new Date(b.state?.startsAt || b.start_time);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
    }
    // Pagination slicing
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return list.slice(start, end);
  }, [type, items, searchQuery, sortOrder, currentPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    const count =
      type === "recordings"
        ? items.filter((item) => {
            const val = searchQuery.toLowerCase();
            return (
              (item.title?.toLowerCase() || "").includes(val) ||
              (item.teacherName?.toLowerCase() || "").includes(val)
            );
          }).length
        : items.length;
    return Math.ceil(count / itemsPerPage) || 1;
  }, [items, searchQuery, type]);

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner thickness="4px" speed="0.65s" size="xl" color="gray.800" />
      </Center>
    );
  }

  return (
    <Box p={4}>
      {type === "recordings" && (
        <HStack mb={4} spacing={4}>
          <Input
            placeholder="Search recordings"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset page on search
            }}
            color="gray.800"
            borderColor="primary"
            borderWidth="2px"
            borderRadius="lg"
          />
          <Button
            onClick={() => {
              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
              setCurrentPage(1);
            }}
            colorScheme="blue"
          >
            Sort by Date: {sortOrder === "desc" ? "Newest" : "Oldest"}
          </Button>
        </HStack>
      )}

      {displayedItems.length > 0 ? (
        <>
          <Flex flexWrap="wrap" gap={4}>
            {displayedItems.map((meeting) => {
              const id = meeting.session_id || meeting._id;
              const meetingDate = new Date(
                meeting.state?.startsAt || meeting.start_time
              );
              const dateStr = meetingDate.toLocaleString() || "Unknown";

              return (
                <Box
                  key={meeting.filename}
                  p={4}
                  borderWidth="2px"
                  borderRadius="lg"
                  shadow="sm"
                  _hover={{ shadow: "md" }}
                  bg="white"
                  color="gray.800"
                  borderColor="primary"
                >
                  <VStack align="start" spacing={2}>
                    <Text fontSize="lg" fontWeight="bold" color="primary">
                      {meeting.title || "Untitled Topic"}
                    </Text>
                    <HStack>
                      <Text fontWeight="semibold">Teacher:</Text>
                      <Text>{meeting.teacherName || "N/A"}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">Total Students:</Text>
                      <Text>{meeting.totalStudents}</Text>
                    </HStack>
                    <HStack>
                      <Tooltip
                        label={meeting.presentStudentsNames.map(
                          (s) => `${s.firstName} ${s.lastName},`
                        )}
                        aria-label="A tooltip"
                        cursor="pointer"
                      >
                        <Text fontWeight="semibold">
                          Present Students {meeting.presentStudents}
                        </Text>
                      </Tooltip>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">Date:</Text>
                      <Text>{dateStr}</Text>
                    </HStack>
                    <HStack>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handlePlay(meeting)}
                      >
                        Play
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              );
            })}
          </Flex>
          {/* Pagination Controls */}
          <Center mt={4}>
            <ButtonGroup>
              <Button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Text alignSelf="center" color="gray.800">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </ButtonGroup>
          </Center>
        </>
      ) : (
        <Center py={10}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            No Recordings
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default RecordingsList;
