import { Flex, Text, VStack } from "@chakra-ui/react";
import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";
import { useSelector } from "react-redux"; // Import useSelector

const UpcomingPage = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  return (
    <Flex spacing={4} w="full" flexDir="column" p={4}>
      <Text fontWeight="bold" fontSize="3xl" color="text">
        {currentLanguage === "fr"
          ? "Réunions à venir"
          : currentLanguage === "ar"
          ? "الاجتماعات القادمة"
          : "Upcoming Meetings"}
      </Text>

      <CallList type="upcoming" />
    </Flex>
  );
};

export default withAuthorization(UpcomingPage, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
