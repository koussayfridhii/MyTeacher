import { Flex, Text, VStack } from "@chakra-ui/react";
import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";

const UpcomingPage = () => {
  return (
    <Flex spacing={4} w="full" flexDir="column" p={4}>
      <Text fontWeight="bold" fontSize="3xl" color="text">
        Upcoming Meeting
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
