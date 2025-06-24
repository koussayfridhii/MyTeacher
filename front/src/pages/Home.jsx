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
  Divider,
} from "@chakra-ui/react";
import MeetingTypeList from "../components/MeetingTypeList";
import { withAuthorization } from "../HOC/Protect";
import useFetchCourses from "../hooks/useFetchCourses";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import CoordinatorsRankChart from "../components/CoordinatorsRankChart";
import IncomesChart from "../components/IncomesChart";
import StudentStatsTable from "../components/StudentStatsTable"; // Added import
import QuizGame from "../components/QuizGame"; // Changed from MAthGame to QuizGame

const Home = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const { courses, isLoading, error } = useFetchCourses("upcoming");
  const currentLanguage =
    useSelector((state) => state.language.language) || "en"; // Renamed for consistency
  const user = useSelector((state) => state.user.user) || "en";

  // Update clock display
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(currentLanguage, {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        new Intl.DateTimeFormat(currentLanguage, {
          dateStyle: "full",
          timeZone: "UTC",
        }).format(now)
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, [currentLanguage]);

  // Compute next upcoming meeting (date & time)
  const nextMeeting = useMemo(() => {
    if (!courses || courses.length === 0) return null;
    const sorted = [...courses].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const next = sorted[0].date;
    return {
      time: dayjs(next).locale(currentLanguage).format("HH:mm"),
      date: next.split("T")[0],
    };
  }, [courses, currentLanguage]);
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
                  {currentLanguage === "fr"
                    ? "Chargement de la prochaine réunion..."
                    : currentLanguage === "ar"
                    ? "جارٍ تحميل الاجتماع التالي..."
                    : "Loading next meeting..."}
                </Text>
              </Flex>
            ) : error ? (
              <Alert status="error">
                <AlertIcon />{" "}
                {currentLanguage === "fr"
                  ? "Impossible de charger les réunions"
                  : currentLanguage === "ar"
                  ? "تعذّر تحميل الاجتماعات"
                  : "Unable to load meetings"}
              </Alert>
            ) : nextMeeting ? (
              <Text fontSize="md" fontWeight="normal">
                {currentLanguage === "fr"
                  ? "Prochaine réunion à"
                  : currentLanguage === "ar"
                  ? "الاجتماع القادم في"
                  : "Upcoming Meeting at"}{" "}
                {nextMeeting.time}{" "}
                {currentLanguage === "fr"
                  ? "le"
                  : currentLanguage === "ar"
                  ? "في"
                  : "on"}{" "}
                {nextMeeting.date}
              </Text>
            ) : (
              <Text fontSize="md" fontWeight="normal">
                {currentLanguage === "fr"
                  ? "Aucune réunion à venir"
                  : currentLanguage === "ar"
                  ? "لا توجد اجتماعات قادمة"
                  : "No Upcoming Meetings"}
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
      {["teacher", "student"].includes(user.role) && <QuizGame />} {/* Changed from Game to QuizGame */}
      {["admin", "coordinator"].includes(user.role) && (
        <>
          <Heading color="primary" textDecor="underline">
            {currentLanguage === "fr"
              ? "Coordinateurs"
              : currentLanguage === "ar"
              ? "المنسقون"
              : "Coordinators"}
          </Heading>
          <CoordinatorsRankChart admin={user.role === "admin"} />
        </>
      )}
      <Divider colorScheme="blue" my={2} size={5} w="full" />
      {["admin"].includes(user.role) && (
        <>
          <Heading color="primary" textDecor="underline">
            {currentLanguage === "fr"
              ? "Revenus"
              : currentLanguage === "ar"
              ? "الدخل"
              : "Incomes"}
          </Heading>
          <IncomesChart />
          <Divider colorScheme="blue" my={2} size={5} w="full" />
          <Heading color="primary" textDecor="underline" mt={6}>
            {currentLanguage === "fr"
              ? "Statistiques des étudiants"
              : currentLanguage === "ar"
              ? "إحصائيات الطلاب"
              : "Student Statistics"}
          </Heading>
          <StudentStatsTable />
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
