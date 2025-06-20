import { Flex, Text } from "@chakra-ui/react";
import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";
import { useSelector } from "react-redux"; // Import useSelector

const PreviousPage = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  return (
    <Flex spacing={4} w="full" flexDir="column" p={4}>
      <Text fontWeight="bold" fontSize="3xl" color="text">
        {currentLanguage === "fr"
          ? "Appels précédents"
          : currentLanguage === "ar"
          ? "المكالمات السابقة"
          : "Previous Calls"}
      </Text>

      <CallList type="ended" />
    </Flex>
  );
};

export default withAuthorization(PreviousPage, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
