import React from "react";
import { Flex } from "@chakra-ui/react";
import SignInForm from "../../components/SignInForm";

const SignIn = () => {
  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      width="100%"
      bg="primary"
    >
      <SignInForm />
    </Flex>
  );
};

export default SignIn;
