/* eslint-disable no-unused-vars */
"use strict";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, SimpleGrid, Text, Spinner, Center } from "@chakra-ui/react";
import { useGetCalls } from "../hooks/useGetCalls";
import MeetingCard from "./MeetingCard";

const CallList = ({ type }) => {
  const navigate = useNavigate();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls({
    allUsers: true,
  });

  const [recordings, setRecordings] = useState([]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
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

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        (callRecordings ?? []).map(async (meeting) => {
          try {
            return await meeting.queryRecordings();
          } catch (err) {
            return { recordings: [] };
          }
        })
      );

      const allRecs = callData
        .filter((c) => c.recordings?.length > 0)
        .flatMap((c) => c.recordings);

      setRecordings(allRecs);
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner thickness="4px" speed="0.65s" size="xl" color="gray.800" />
      </Center>
    );
  }

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <Box p={4}>
      {calls?.length > 0 ? (
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          {calls.map((meeting) => {
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
                key={id || meeting._id}
                icon={icon}
                title={title}
                date={date}
                isPreviousMeeting={type === "ended"}
                link={link}
                {...buttonProps}
                handleClick={
                  () =>
                    navigate(`/meeting/recordings/videoPlayer`, {
                      state: { link },
                      target: "_blank",
                    })
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
