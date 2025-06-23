import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  Tag,
} from "@chakra-ui/react";
import apiClient from "../../hooks/apiClient"; // Assuming apiClient is set up for authenticated requests
import { format } from 'date-fns'; // For formatting dates

const DashboardMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue("white", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/contact-messages");
        if (response.data && response.data.success) {
          setMessages(response.data.data);
        } else {
          setError("Failed to fetch messages or data format incorrect.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "An error occurred while fetching messages.");
        console.error("Fetch messages error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (isLoading) {
    return (
      <VStack justify="center" align="center" height="60vh">
        <Spinner size="xl" />
        <Text mt={4}>Loading messages...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box p={5}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ base: 3, md: 6 }} bg={cardBg} borderRadius="lg" shadow="md">
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Contact Form Submissions
      </Heading>
      {messages.length === 0 ? (
        <Text textAlign="center" py={10}>
          No messages found.
        </Text>
      ) : (
        <TableContainer borderWidth="1px" borderColor={tableBorderColor} borderRadius="md">
          <Table variant="simple">
            <Thead bg={useColorModeValue("gray.50", "gray.800")}>
              <Tr>
                <Th>Date</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Message</Th>
              </Tr>
            </Thead>
            <Tbody>
              {messages.map((msg) => (
                <Tr key={msg._id} _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}>
                  <Td>
                    <Tag size="sm" colorScheme="teal" variant="subtle">
                        {format(new Date(msg.createdAt), "yyyy-MM-dd HH:mm")}
                    </Tag>
                  </Td>
                  <Td>{msg.name}</Td>
                  <Td><Text as="a" href={`mailto:${msg.email}`} color="teal.500" _hover={{textDecoration: "underline"}}>{msg.email}</Text></Td>
                  <Td><Text as="a" href={`tel:${msg.phone}`} color="teal.500" _hover={{textDecoration: "underline"}}>{msg.phone}</Text></Td>
                  <Td whiteSpace="pre-wrap" maxW="400px" overflow="hidden" textOverflow="ellipsis">{msg.message}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DashboardMessages;
