import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
  TableContainer,
  TableCaption,
} from "@chakra-ui/react";
import apiClient from "../hooks/apiClient.js"; // Import apiClient

const StudentStatsTable = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/users/students");
        // Assuming the actual data is in response.data based on common apiClient patterns
        // And that response.data itself is the object with totalStudents and statsByMonth
        if (response && response.data) {
          setStats(response.data);
        } else {
          // If response.data is not what we expect, treat it as an issue
          setStats(null); // Or set an appropriate error
          setError(new Error("No data received from API."));
        }
      } catch (err) {
        setError(err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        There was an error processing your request:{" "}
        {error.message || "Unknown error"}
      </Alert>
    );
  }

  // Check if stats is null or if statsByMonth is empty AFTER loading and error checks
  if (!stats || !stats.totalStudents) {
    // If stats is null OR if there's no totalStudents (implies no valid data)
    // This also covers the case where the API might return an empty object or stats.totalStudents is 0/undefined
    return (
      <Box p={4}>
        <Heading as="h2" size="md" mb={2}>
          Student Statistics
        </Heading>
        <Alert status="info">
          <AlertIcon />
          No student statistics found or data is incomplete.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} color="gray.800" w="full">
      <Text fontSize="xl" mb={4}>
        Total Students: <strong>{stats.totalStudents}</strong>
      </Text>
      <TableContainer w="full">
        <Table variant="striped" colorScheme="blue" size="sm" w="full">
          <TableCaption placement="top">
            Monthly New Student Registrations
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Month</Th>
              <Th isNumeric>New Students</Th>
            </Tr>
          </Thead>
          <Tbody>
            {stats.statsByMonth && stats.statsByMonth.length > 0 ? (
              stats.statsByMonth.map((stat, index) => (
                <Tr key={index}>
                  <Td>{stat.month}</Td>
                  <Td isNumeric>{stat.count}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={2} textAlign="center">
                  No monthly data available.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentStatsTable;
