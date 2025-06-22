import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Spinner, Text, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button } from "@chakra-ui/react"; // Added Button

const AdminRoute = () => {
  const { user, token, status } = useSelector((state) => state.user);

  if (status === "loading") {
    return (
      <Center h="100vh">
        <VStack>
          <Spinner size="xl" />
          <Text mt={2}>Loading user information...</Text>
        </VStack>
      </Center>
    );
  }

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (user && user.role === "admin") {
    return <Outlet />;
  } else {
    // Optional: Show a message or redirect to a 'not authorized' page
    // For now, redirecting to dashboard home or showing a message
    return (
        <Box p={5} minH="calc(100vh - 120px)" display="flex" alignItems="center" justifyContent="center">
            <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="auto"
                borderRadius="md"
                p={8}
                maxW="lg"
            >
                <AlertIcon boxSize="50px" mr={0} />
                <AlertTitle mt={4} mb={2} fontSize="xl" fontWeight="bold">
                    Access Denied
                </AlertTitle>
                <AlertDescription maxWidth="md">
                    You do not have the necessary permissions to access this page.
                    This area is restricted to administrators only.
                    If you believe this is an error, please contact support.
                </AlertDescription>
                 <Button mt={6} colorScheme="teal" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </Alert>
        </Box>
    );
    // Or simply navigate away: return <Navigate to="/dashboard" replace />;
  }
};

export default AdminRoute;
