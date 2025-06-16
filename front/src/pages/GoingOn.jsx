import { Flex, Text } from "@chakra-ui/react";
import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";

const GoingOn = () => {
  return (
    <Flex spacing={4} w="full" flexDir="column" p={4}>
      <Text fontWeight="bold" fontSize="3xl" color="text">
        Going On Calls
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
