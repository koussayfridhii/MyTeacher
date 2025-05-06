import React from "react";
import { Flex } from "@chakra-ui/react";
import SignUpForm from "../../components/SIgnUpForm";
const SignUp = () => {
  return (
    <Flex
      w="100%"
      bg="primary"
      minH="100vh"
      p={4}
      justify="center"
      align="center"
    >
      <SignUpForm />
    </Flex>
  );
};

export default SignUp;
