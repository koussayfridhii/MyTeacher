import { Flex, Text } from "@chakra-ui/react";
import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";

const PreviousPage = () => {
  return (
    <Flex spacing={4} w="full" flexDir="column" p={4}>
      <Text fontWeight="bold" fontSize="3xl" color="text">
        Previous Calls
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
