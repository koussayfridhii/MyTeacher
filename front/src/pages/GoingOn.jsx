import { Flex, Text } from "@chakra-ui/react";
import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";
import { useSelector } from "react-redux";

const GoingOn = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  return (
    <Flex spacing={4} w="full" flexDir="column" p={4}>
      <Text fontWeight="bold" fontSize="3xl" color="text">
        {currentLanguage === "fr"
          ? "Appels en cours"
          : currentLanguage === "ar"
          ? "المكالمات الجارية"
          : "Ongoing Calls"}
      </Text>

      <CallList type="now" />
    </Flex>
  );
};

export default withAuthorization(GoingOn, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
