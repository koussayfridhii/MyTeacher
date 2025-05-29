import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../hooks/apiClient"; // Assuming apiClient is in hooks directory
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

const fetchPotentialClients = async () => {
  const { data } = await apiClient.get("/potential-clients");
  return data;
};

const PotentialClientsListView = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user); // Accessing user from Redux store
  const userRole = user?.role;

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["potentialClients"],
    queryFn: fetchPotentialClients,
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error fetching potential clients: {error?.message || "Unknown error"}
      </Alert>
    );
  }

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">
          Potential Clients
        </Heading>
        {(userRole === "admin" || userRole === "coordinator") && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={() => navigate("/dashboard/potential-clients/create")}
          >
            Create New Client
          </Button>
        )}
      </Flex>

      {clients && clients.length > 0 ? (
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Manager</Th>
              <Th>Assistant</Th>
              <Th>Comments</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {clients.map((client) => (
              <Tr key={client._id}>
                <Td>{client.name}</Td>
                <Td>{client.phone}</Td>
                <Td>{client.email}</Td>
                <Td>{client.status}</Td>
                <Td>
                  {client.manager
                    ? `${client.manager.firstName} ${client.manager.lastName}`
                    : "N/A"}
                </Td>
                <Td>
                  {client.assistant
                    ? `${client.assistant.firstName} ${client.assistant.lastName}`
                    : "N/A"}
                </Td>
                <Td>{client.commentaires ? client.commentaires.length : 0}</Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() =>
                      navigate(`/dashboard/potential-clients/${client._id}`)
                    }
                  >
                    View Details
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>No potential clients found.</Text>
      )}
    </Box>
  );
};

export default PotentialClientsListView;
