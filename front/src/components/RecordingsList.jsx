/* eslint-disable no-unused-vars */
"use strict";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, SimpleGrid, Text, Spinner, Center } from "@chakra-ui/react";
import { useGetCalls } from "../hooks/useGetCalls";
import MeetingCard from "./MeetingCard";
import { useSelector } from "react-redux";
import axios from "axios";
const allowedToFetchAllCalls = ["admin", "coordinator"];
const CallList = ({ type }) => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls({
    allUsers: allowedToFetchAllCalls.includes(user?.role),
  });

  const [recordings, setRecordings] = useState([]);
  async function fetchCourses() {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/classes/`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    const now = new Date();
    switch (type) {
      case "upcoming":
        setCourses(
          response.data.filter((course) => {
            const courseDate = new Date(course.date);
            return courseDate > now;
          })
        );
        break;
      case "ended":
        setCourses(
          response.data.filter((course) => {
            const courseDate = new Date(course.date);
            return courseDate < now;
          })
        );
        break;
      default:
        break;
    }
  }

  const getCalls = () => {
    switch (type) {
      case "ended":
        fetchCourses();
        return;
      case "recordings":
        return recordings;
      case "upcoming": {
        fetchCourses();
        return;
      }
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "upcoming":
        return "No Upcoming Calls";
      case "recordings":
        return "No Recordings";
      default:
        return "";
    }
  };

  const fetchRecordings = useCallback(async () => {
    if (!Array.isArray(callRecordings) || callRecordings.length === 0) {
      setRecordings([]);
      return;
    }

    const results = await Promise.allSettled(
      callRecordings.map((meeting) => meeting.queryRecordings())
    );

    const allRecs = results
      .filter(
        (r) => r.status === "fulfilled" && Array.isArray(r.value.recordings)
      )
      .flatMap((r) => r.value.recordings);

    setRecordings(allRecs);
  }, [callRecordings]);

  useEffect(() => {
    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, fetchRecordings]);

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner thickness="4px" speed="0.65s" size="xl" color="gray.800" />
      </Center>
    );
  }

  // const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();
  fetchCourses();
  return (
    <Box p={4}>
      {courses?.length > 0 ? (
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          {courses.map((meeting) => {
            const id = meeting.id;
            const isRecording = type === "recordings";
            const title =
              meeting.state?.custom?.description ||
              meeting.filename?.substring(0, 20) ||
              "No Description";
            const date =
              meeting.state?.startsAt?.toLocaleString() ||
              meeting.start_time?.toLocaleString();
            const icon = isRecording
              ? "/assets/icons/recordings.svg"
              : type === "ended"
              ? "/assets/icons/previous.svg"
              : "/assets/icons/upcoming.svg";
            const link = isRecording ? meeting.url : `${id}`;
            const buttonProps = isRecording
              ? { buttonIcon1: "/assets/icons/play.svg", buttonText: "Play" }
              : { buttonText: "Start" };

            return (
              <MeetingCard
                key={meeting._id}
                icon={icon}
                title={title}
                date={date}
                isPreviousMeeting={type === "ended"}
                link={link}
                {...buttonProps}
                handleClick={
                  () =>
                    isRecording
                      ? navigate(`/meeting/recordings/${id}`, {
                          state: { link },
                          target: "_blank",
                        })
                      : navigate(`/meeting/${id}`)
                  // window.open(
                  //   "http://localhost:3000/meeting/recordings/videoPlayer",
                  //   "_blank",
                  //   "rel=noopener noreferrer"
                  // )
                }
              />
            );
          })}
        </SimpleGrid>
      ) : (
        <Center py={10}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {noCallsMessage}
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default CallList;
