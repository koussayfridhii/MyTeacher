import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  FormLabel,
  FormControl,
  FormErrorMessage,
  Box,
  Heading,
  VStack,
  useToast,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton, // For password visibility toggle
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"; // Icons for toggle
import apiClient from "../../hooks/apiClient";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // For client-side validation messages
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handlePasswordVisibilityToggle = () => setShowPassword(!showPassword);
  const handleConfirmPasswordVisibilityToggle = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(""); // Clear previous client-side errors

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(`/auth/reset-password/${token}`, { password });
      toast({
        title: "Success",
        description:
          "Your password has been reset successfully. You can now sign in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Optional: Redirect to sign-in page after a delay
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" minH="100vh" bg="gray.100">
      <Box
        w={{ base: "90%", sm: "md" }}
        p={8}
        bg="white"
        rounded="lg"
        shadow="md"
      >
        <VStack spacing={6}>
          <Heading as="h2" size="lg" textAlign="center" color="gray.900">
            Reset Your Password
          </Heading>
          <Box as="form" onSubmit={handleSubmit} w="100%">
            <VStack spacing={4}>
              <FormControl
                id="password"
                isRequired
                isInvalid={
                  !!passwordError &&
                  (passwordError.includes("6 characters") ||
                    passwordError.includes("match"))
                }
              >
                <FormLabel color="gray.700" fontSize="sm" fontWeight="medium">
                  New Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={handlePasswordVisibilityToggle}
                    />
                  </InputRightElement>
                </InputGroup>
                {/* Display password length error here specifically if preferred */}
              </FormControl>

              <FormControl
                id="confirmPassword"
                isRequired
                isInvalid={!!passwordError && passwordError.includes("match")}
              >
                <FormLabel color="gray.700" fontSize="sm" fontWeight="medium">
                  Confirm New Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      icon={
                        showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                      }
                      onClick={handleConfirmPasswordVisibilityToggle}
                    />
                  </InputRightElement>
                </InputGroup>
                {/* Display password match error here specifically */}
              </FormControl>

              {/* General password error message display */}
              {passwordError && (
                <FormControl isInvalid={!!passwordError}>
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                </FormControl>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                colorScheme="blue"
                w="full"
              >
                Reset Password
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ResetPasswordPage;
