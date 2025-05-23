import React, { useEffect } from "react";
import { Flex, Text } from "@chakra-ui/react";
import SignInForm from "../../components/SignInForm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const SignIn = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn]);
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
