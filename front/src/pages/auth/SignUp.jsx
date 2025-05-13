import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import SignUpForm from "../../components/SIgnUpForm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const SignUp = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn]);
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
