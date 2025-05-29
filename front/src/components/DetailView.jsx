import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import apiClient from "../hooks/apiClient"; // Assuming apiClient is in hooks directory
import { format, subMonths, isBefore } from "date-fns";
import {
  Box,
  Heading,
  Text,
  Tag,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Textarea,
  Select,
  List,
  ListItem,
  Avatar,
  Flex,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  HStack,
} from "@chakra-ui/react";

const fetchPotentialClient = async (clientId) => {
  const { data } = await apiClient.get(`/potential-clients/${clientId}`);
  return data;
};

const PotentialClientDetailView = () => {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const user = useSelector((state) => state.user.user); // Accessing user from Redux store

  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const {
    data: client,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["potentialClient", clientId],
    queryFn: () => fetchPotentialClient(clientId),
    enabled: !!clientId, // Only run query if clientId is available
    onSuccess: (data) => {
      setSelectedStatus(data.status); // Initialize select with current status
    },
  });

  // Memoize derived booleans for better performance and readability
  const isUserManager = useMemo(
    () => client?.manager?._id === user?._id,
    [client, user]
  );
  const isUserAssistant = useMemo(
    () => client?.assistant?._id === user?._id,
    [client, user]
  );
  const canUserCommentOrUpdate = useMemo(
    () => isUserManager || isUserAssistant,
    [isUserManager, isUserAssistant]
  );
  const isClientOlderThanOneMonth = useMemo(() => {
    if (!client?.createdAt) return false;
    return isBefore(new Date(client.createdAt), subMonths(new Date(), 1));
  }, [client]);

  const canAssignAssistant = useMemo(() => {
    return (
      user?.role === "coordinator" &&
      !client?.assistant &&
      isClientOlderThanOneMonth
    );
  }, [user, client, isClientOlderThanOneMonth]);

  // --- Mutations ---
  const addCommentMutation = useMutation({
    mutationFn: (commentData) =>
      apiClient.post(`/potential-clients/${clientId}/comment`, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["potentialClient", clientId],
      });
      toast({
        title: "Comment added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewComment("");
    },
    onError: (err) => {
      toast({
        title: "Error adding comment.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const assignAssistantMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/potential-clients/${clientId}/assistant`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["potentialClient", clientId],
      });
      toast({
        title: "Assistant assigned.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (err) => {
      toast({
        title: "Error assigning assistant.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus) =>
      apiClient.patch(`/potential-clients/${clientId}/status`, {
        status: newStatus,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["potentialClient", clientId],
      });
      toast({
        title: "Status updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (err) => {
      toast({
        title: "Error updating status.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Revert optimistic update if needed, or refetch to be sure
      setSelectedStatus(client?.status); // Revert select to original status on error
    },
  });

  // --- Handlers ---
  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({ text: newComment });
    }
  };

  const handleAssignAssistant = () => {
    assignAssistantMutation.mutate();
  };

  const handleStatusChange = (e) => {
    const newStatusValue = e.target.value;
    setSelectedStatus(newStatusValue); // Optimistic update for UI responsiveness
    updateStatusMutation.mutate(newStatusValue);
  };

  // --- Render Logic ---
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
        Error fetching client details:{" "}
        {error?.response?.data?.message || error?.message || "Unknown error"}
      </Alert>
    );
  }

  if (!client) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Client not found.
      </Alert>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "intéressé":
        return "green";
      case "pas intéressé":
        return "red";
      case "injoignable":
        return "orange";
      default:
        return "gray";
    }
  };

  return (
    <Box p={5}>
      <Button mb={4} onClick={() => navigate("/dashboard/potential-clients")}>
        Back to List
      </Button>
      <Heading as="h1" size="xl" mb={6}>
        {client.name}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Card>
          <CardHeader>
            <Heading size="md">Client Details</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<Divider />} spacing={4}>
              <HStack>
                <Text fontWeight="bold">Email:</Text>
                <Text>{client.email}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">Phone:</Text>
                <Text>{client.phone}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">Status:</Text>
                <Tag size="md" colorScheme={getStatusColor(client.status)}>
                  {client.status}
                </Tag>
              </HStack>
              <HStack>
                <Text fontWeight="bold">Manager:</Text>
                <Text>
                  {client.manager?.firstName} {client.manager?.lastName}
                </Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">Assistant:</Text>
                <Text>
                  {client.assistant
                    ? `${client.assistant.firstName} ${client.assistant.lastName}`
                    : "N/A"}
                </Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">Created At:</Text>
                <Text>{format(new Date(client.createdAt), "PPP p")}</Text>
              </HStack>
            </Stack>
          </CardBody>
        </Card>

        <VStack spacing={6} align="stretch">
          {canUserCommentOrUpdate && (
            <Card>
              <CardHeader>
                <Heading size="md">Update Status</Heading>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <FormLabel htmlFor="status">Client Status</FormLabel>
                  <Select
                    id="status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    isDisabled={
                      updateStatusMutation.isLoading || !canUserCommentOrUpdate
                    }
                  >
                    <option value="intéressé">Intéressé</option>
                    <option value="pas intéressé">Pas intéressé</option>
                    <option value="injoignable">Injoignable</option>
                  </Select>
                </FormControl>
              </CardBody>
            </Card>
          )}

          {canAssignAssistant && (
            <Button
              colorScheme="blue"
              onClick={handleAssignAssistant}
              isLoading={assignAssistantMutation.isLoading}
              isDisabled={
                !canAssignAssistant || assignAssistantMutation.isLoading
              }
            >
              Assign Myself as Assistant
            </Button>
          )}
        </VStack>
      </SimpleGrid>

      <Box mt={10}>
        <Heading size="lg" mb={4}>
          Comments
        </Heading>
        {canUserCommentOrUpdate && (
          <VStack
            as="form"
            onSubmit={(e) => e.preventDefault()}
            spacing={4}
            mb={6}
            align="stretch"
          >
            <FormControl>
              <FormLabel htmlFor="comment">Add a Comment</FormLabel>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment here..."
                isDisabled={addCommentMutation.isLoading}
              />
            </FormControl>
            <Button
              alignSelf="flex-end"
              colorScheme="teal"
              onClick={handleAddComment}
              isLoading={addCommentMutation.isLoading}
              isDisabled={!newComment.trim()}
            >
              Submit Comment
            </Button>
          </VStack>
        )}
        {client.commentaires && client.commentaires.length > 0 ? (
          <List spacing={3}>
            {client.commentaires
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment) => (
                <ListItem
                  key={comment._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Flex align="center">
                    <Avatar
                      size="sm"
                      name={`${comment.author?.firstName || ""} ${
                        comment.author?.lastName || ""
                      }`}
                      mr={3}
                    />
                    <Box>
                      <Text fontWeight="bold">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {format(new Date(comment.createdAt), "PPP p")}
                      </Text>
                    </Box>
                  </Flex>
                  <Text mt={2}>{comment.text}</Text>
                </ListItem>
              ))}
          </List>
        ) : (
          <Text>No comments yet.</Text>
        )}
      </Box>
    </Box>
  );
};

export default PotentialClientDetailView;
