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
  Button,
  SimpleGrid, // Added for game card layout
  Card, // Added for game card
  CardHeader, // Added for game card
  CardBody, // Added for game card
  CardFooter, // Added for game card
  Icon, // For game icons
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom"; // For navigation
import { FaBrain, FaCalculator, FaSearch } from "react-icons/fa"; // Example icons

import MeetingTypeList from "../components/MeetingTypeList";
import { withAuthorization } from "../HOC/Protect";
import useFetchCourses from "../hooks/useFetchCourses";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import CoordinatorsRankChart from "../components/CoordinatorsRankChart";
import IncomesChart from "../components/IncomesChart";
import StudentStatsTable from "../components/StudentStatsTable"; // Added import
import Game from "../components/MAthGame"; // This is the Math Game
import QuizGame from "../components/QuizGame"; // This is the new Trivia Quiz Game
import { translations } from "../utils/translations"; // For button text

const Home = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const { courses, isLoading, error } = useFetchCourses("upcoming");
  const currentLanguage =
    useSelector((state) => state.language.language) || "en";
  const user = useSelector((state) => state.user.user);

  // No longer need showTriviaQuiz state if we navigate to separate pages for each game.
  // const [showTriviaQuiz, setShowTriviaQuiz] = useState(false);

  // Game links data
  const gameLinks = [
    {
      id: "mathQuiz",
      titleKey: "home.mathQuizTitle",
      descriptionKey: "home.mathQuizDescription",
      path: "/dashboard/math-game", // Assuming a dedicated page, or adapt if it's modal/inline
      icon: FaCalculator,
      colorScheme: "teal",
    },
    {
      id: "triviaQuiz",
      titleKey: "home.triviaQuizTitle",
      descriptionKey: "home.triviaQuizDescription",
      path: "/dashboard/trivia-quiz", // Assuming a dedicated page
      icon: FaBrain,
      colorScheme: "purple",
    },
    {
      id: "grammarDetective",
      titleKey: "home.grammarDetectiveTitle",
      descriptionKey: "home.grammarDetectiveDescription",
      path: "/dashboard/grammar-detective",
      icon: FaSearch,
      colorScheme: "orange",
    },
  ];

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
        h={{ base: "auto", md: "303px" }} // Adjusted height for responsiveness
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
            mx={{base: "auto", md: "0"}} // Align left on md+
            my={4}
            p={2}
            borderRadius="md"
            textAlign={{base: "center", md: "left"}} // Align text left on md+
            backdropFilter="auto"
            backdropBlur="10px"
          >
            {isLoading ? (
              <Flex align="center" justify={{base: "center", md: "flex-start"}}>
                <Spinner size="sm" />
                <Text ml={2} fontSize="md">
                  {translations[currentLanguage]?.loading || "Loading next meeting..."}
                </Text>
              </Flex>
            ) : error ? (
              <Alert status="error" justifyContent={{base: "center", md: "flex-start"}}>
                <AlertIcon />
                {translations[currentLanguage]?.errorLoadingMeetings || "Unable to load meetings"}
              </Alert>
            ) : nextMeeting ? (
              <Text fontSize="md" fontWeight="normal">
                {(translations[currentLanguage]?.upcomingMeetingAt || "Upcoming Meeting at")}{" "}
                {nextMeeting.time}{" "}
                {(translations[currentLanguage]?.on || "on")}{" "}
                {nextMeeting.date}
              </Text>
            ) : (
              <Text fontSize="md" fontWeight="normal">
                {translations[currentLanguage]?.noUpcomingMeetings || "No Upcoming Meetings"}
              </Text>
            )}
          </Box>

          <Box textAlign={{base: "center", md: "left"}}> {/* Align text left on md+ */}
            <Text fontSize={{ base: "4xl", lg: "7xl" }} fontWeight="extrabold">
              {time}
            </Text>
            <Text
              fontSize={{ base: "lg", lg: "2xl" }}
              fontWeight="medium"
              color="sky.400" // Consider making this theme-aware if needed
            >
              {date}
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* MeetingTypeList can be uncommented if needed */}
      {/* <MeetingTypeList /> */}

      {/* Games Section for Teachers and Students */}
      {user && ["teacher", "student"].includes(user.role) && (
        <Box w="full" p={4} borderWidth="1px" borderRadius="lg" bg={useColorModeValue("gray.50", "gray.800")} mt={8}>
          <Heading size="lg" mb={6} color={useColorModeValue("gray.700", "white")} textAlign="center">
            {translations[currentLanguage]?.['home.gamesSectionTitle'] || "Games & Activities"}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {gameLinks.map((game) => (
              <Card
                key={game.id}
                as={RouterLink}
                to={game.path}
                _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
                transition="all 0.2s"
                bg={useColorModeValue("white", "gray.700")}
              >
                <CardHeader pb={2}>
                  <Flex align="center">
                    <Icon as={game.icon} w={8} h={8} color={`${game.colorScheme}.500`} mr={3}/>
                    <Heading size="md" color={useColorModeValue("gray.700", "white")}>
                      {translations[currentLanguage]?.[game.titleKey] || game.titleKey.split('.').pop()}
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody pt={2}>
                  <Text color={useColorModeValue("gray.600", "gray.300")}>
                    {translations[currentLanguage]?.[game.descriptionKey] || game.descriptionKey.split('.').pop()}
                  </Text>
                </CardBody>
                <CardFooter>
                   <Button variant="solid" colorScheme={game.colorScheme} width="full">
                     {translations[currentLanguage]?.['global.button.play'] || "Play Game"}
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Admin and Coordinator specific sections */}
      {user && ["admin", "coordinator"].includes(user.role) && (
        <>
          <Heading color="primary" textDecor="underline">
            {currentLanguage === "fr"
              ? "Graphique des Coordinateurs"
              : currentLanguage === "ar"
              ? "الرسم البياني للمنسقين"
              : "Coordinators Rank"}
          </Heading>
          <CoordinatorsRankChart admin={user.role === "admin"} />
          <Divider my={8} />
        </>
      )}

      {user && user.role === "admin" && (
        <>
          <Heading color="primary" textDecor="underline">
            {currentLanguage === "fr"
              ? "Graphique des Revenus"
              : currentLanguage === "ar"
              ? "الرسم البياني للدخل"
              : "Incomes Chart"}
          </Heading>
          <IncomesChart />
          <Divider my={8} />
          <Heading color="primary" textDecor="underline">
             {currentLanguage === "fr"
              ? "Statistiques des Étudiants"
              : currentLanguage === "ar"
              ? "إحصائيات الطلاب"
              : "Student Statistics"}
          </Heading>
          <StudentStatsTable />
        </>
      )}
    </Flex>
  );
};

// Ensure all roles that need to see the Home page are included here.
// withAuthorization will handle redirection if the role is not permitted.
export default withAuthorization(Home, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
