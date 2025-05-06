import React, { useState, useEffect } from "react";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import MeetingTypeList from "../components/MeetingTypeList";
import StrealVideoCallProvider from "../providers/StreamClientProvider";
const Home = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
      }).format(now);
      setTime(formattedTime);
      setDate(formattedDate);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const heroBg = useColorModeValue(
    "url('./assets/images/hero-background.png')",
    "url('./assets/images/hero-background.png')"
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
            maxW="273px"
            mx="auto"
            my={4}
            p={2}
            borderRadius="md"
            textAlign="center"
            backdropFilter="auto"
            backdropBlur="10px"
          >
            <Text fontSize="md" fontWeight="normal">
              Upcoming Meeting at: 12:30 PM
            </Text>
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
      <MeetingTypeList />
    </Flex>
  );
};

export default Home;
