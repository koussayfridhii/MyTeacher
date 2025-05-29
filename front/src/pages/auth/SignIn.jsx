import React, { useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import SignInForm from "../../components/SignInForm";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
const SignIn = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [isLoggedIn]);
  return (
    <>
      <Box p={2} bg="#fff">
        <Link to="/" color="primray" fontWeight="bold">
          Back to Landing
        </Link>
      </Box>
      <Flex align="center" justify="center" minH="100vh" width="100%" bg="#fff">
        <SignInForm />
      </Flex>
    </>
  );
};

export default SignIn;
