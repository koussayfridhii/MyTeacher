import React from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box
          textAlign="center"
          py={10}
          px={6}
          minH="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Heading as="h2" size="xl" mt={6} mb={2}>
            Something went wrong.
          </Heading>
          <Text color={"gray.500"} mb={6}>
            We're sorry, but an unexpected error occurred. Please try refreshing
            the page or contact support if the problem persists.
          </Text>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              m={4}
              textAlign="left"
            >
              <Heading as="h4" size="md" mb={2}>
                Error Details (Development Mode):
              </Heading>
              <Text
                as="pre"
                whiteSpace="pre-wrap"
                fontFamily="monospace"
                fontSize="sm"
              >
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text
                  as="pre"
                  whiteSpace="pre-wrap"
                  fontFamily="monospace"
                  fontSize="xs"
                  mt={2}
                >
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </Box>
          )}
          <Button
            colorScheme="teal"
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
