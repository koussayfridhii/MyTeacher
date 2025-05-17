import React from "react";
import ProfileCard from "../components/ProfileCard";
import { Flex } from "@chakra-ui/react";
import { withAuthorization } from "../HOC/Protect";

const Profile = () => {
  return (
    <Flex w="full" h="100vh" justify="center" align="center">
      <ProfileCard />
    </Flex>
  );
};

export default withAuthorization(Profile, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
