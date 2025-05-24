import React, { useState } from "react";
import {
  Button,
  Input,
  FormLabel,
  FormControl,
  Box,
  Heading,
  Text,
  VStack,
  useToast,
  Flex,
  // Spinner // Import Spinner if you want to show loading state on button
} from "@chakra-ui/react";
import apiClient from "../../hooks/apiClient";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      toast({
        title: "Request Sent",
        description:
          "If your email is registered, you will receive a password reset link shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setEmail(""); // Clear email field on success
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
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.100" // Equivalent to bg-gray-100
    >
      <Box
        w={{ base: "90%", sm: "md" }} // Responsive width, max-w-md equivalent
        p={8} // Equivalent to p-8
        bg="white" // Equivalent to bg-white
        rounded="lg" // Equivalent to rounded-lg
        shadow="md" // Equivalent to shadow-md
      >
        <VStack spacing={6}>
          {" "}
          {/* Equivalent to space-y-6 */}
          <Heading as="h2" size="lg" textAlign="center" color="gray.900">
            Forgot Your Password?
          </Heading>
          <Text fontSize="sm" textAlign="center" color="gray.600">
            Enter your email address below and we'll send you a link to reset
            your password.
          </Text>
          <Box as="form" onSubmit={handleSubmit} w="100%">
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel color="gray.700" fontSize="sm" fontWeight="medium">
                  Email address
                </FormLabel>
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  // Styling to match Tailwind version if needed, Chakra defaults are usually good
                  // className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </FormControl>

              <Button
                type="submit"
                isLoading={isLoading}
                // loadingText="Sending..." // Optional: Text to show when isLoading is true
                colorScheme="blue" // Chakra's way of theming buttons, similar to bg-indigo-600
                w="full" // Equivalent to w-full
                // className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Reset Link
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ForgotPasswordPage;
