/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Heading,
} from "@chakra-ui/react";
import MeetingTypeList from "../components/MeetingTypeList";
import { withAuthorization } from "../HOC/Protect";
import useFetchCourses from "../hooks/useFetchCourses";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import CoordinatorsRankChart from "../components/CoordinatorsRankChart";
import IncomesChart from "../components/IncomesChart";
import Game from "../components/MAthGame";

const translations = {
  en: {
    upcoming: "Upcoming Meeting at",
    noMeetings: "No Upcoming Meetings",
    loading: "Loading next meeting...",
    unable: "Unable to load meetings",
  },
  fr: {
    upcoming: "Prochaine réunion à",
    noMeetings: "Aucune réunion à venir",
    loading: "Chargement de la prochaine réunion...",
    unable: "Impossible de charger les réunions",
  },
  ar: {
    upcoming: "الاجتماع القادم في",
    noMeetings: "لا توجد اجتماعات قادمة",
    loading: "جارٍ تحميل الاجتماع التالي...",
    unable: "تعذّر تحميل الاجتماعات",
  },
};

const Home = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const { courses, isLoading, error } = useFetchCourses("upcoming");
  const language = useSelector((state) => state.language.language) || "en";
  const user = useSelector((state) => state.user.user) || "en";
  const t = translations[language] || translations.en;

  // Update clock display
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" })
      );
      setDate(
        new Intl.DateTimeFormat(language, {
          dateStyle: "full",
          timeZone: "UTC",
        }).format(now)
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, [language]);

  // Compute next upcoming meeting (date & time)
  const nextMeeting = useMemo(() => {
    if (!courses || courses.length === 0) return null;
    const sorted = [...courses].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const next = sorted[0].date;
    return {
      time: dayjs(next).locale(language).format("HH:mm"),
      date: next.split("T")[0],
    };
  }, [courses, language]);
  useEffect(() => {}, [nextMeeting]);
  const heroBg = useColorModeValue(
    "url('/assets/images/hero-background.png')",
    "url('/assets/images/hero-background.png')"
  );

  return (
    <Flex
      as="section"
      w="full"
      h="full"
      color="white"
      direction="column"
      gap={10}
      align="center"
      bg="white"
      p={4}
    >
      <Box
        h="303px"
        w="full"
        bgImage={heroBg}
        bgSize="cover"
        bgPosition="center"
        borderRadius="20px"
        overflow="hidden"
        p={5}
      >
        <Flex
          direction="column"
          justify="space-between"
          h="full"
          px={{ base: 5, md: 11 }}
          py={{ base: 8, md: 0 }}
        >
          <Box
            bg={useColorModeValue("rgba(255,255,255,0.2)", "rgba(0,0,0,0.2)")}
            maxW="400px"
            mx="auto"
            my={4}
            p={2}
            borderRadius="md"
            textAlign="center"
            backdropFilter="auto"
            backdropBlur="10px"
          >
            {isLoading ? (
              <Flex align="center" justify="center">
                <Spinner size="sm" />
                <Text ml={2} fontSize="md">
                  {t.loading}
                </Text>
              </Flex>
            ) : error ? (
              <Alert status="error">
                <AlertIcon /> {t.unable}
              </Alert>
            ) : nextMeeting ? (
              <Text fontSize="md" fontWeight="normal">
                {t.upcoming} {nextMeeting.time}{" "}
                {language === "fr" ? "le" : language === "ar" ? "في" : "on"}{" "}
                {nextMeeting.date}
              </Text>
            ) : (
              <Text fontSize="md" fontWeight="normal">
                {t.noMeetings}
              </Text>
            )}
          </Box>

          <Box>
            <Text fontSize={{ base: "4xl", lg: "7xl" }} fontWeight="extrabold">
              {time}
            </Text>
            <Text
              fontSize={{ base: "lg", lg: "2xl" }}
              fontWeight="medium"
              color="sky.400"
            >
              {date}
            </Text>
          </Box>
        </Flex>
      </Box>
      {["teacher", "student"].includes(user.role) && <Game />}

      {["admin"].includes(user.role) && (
        <>
          <Heading color="primary" textDecor="underline">
            Incomes
          </Heading>
          <IncomesChart />
        </>
      )}
      {["admin", "coordinator"].includes(user.role) && (
        <>
          <Heading color="primary" textDecor="underline">
            Coordinators
          </Heading>
          <CoordinatorsRankChart admin={user.role === "admin"} />
        </>
      )}
      {/* <MeetingTypeList /> */}
    </Flex>
  );
};

export default withAuthorization(Home, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
