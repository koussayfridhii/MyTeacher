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
  const currentLanguage = useSelector((state) => state.language.language); // Get current language

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
        title:
          currentLanguage === "fr"
            ? "Commentaire ajouté."
            : currentLanguage === "ar"
            ? "تمت إضافة التعليق."
            : "Comment added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewComment("");
    },
    onError: (err) => {
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur lors de l'ajout du commentaire."
            : currentLanguage === "ar"
            ? "خطأ في إضافة التعليق."
            : "Error adding comment.",
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
        title:
          currentLanguage === "fr"
            ? "Assistant assigné."
            : currentLanguage === "ar"
            ? "تم تعيين المساعد."
            : "Assistant assigned.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (err) => {
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur lors de l'assignation de l'assistant."
            : currentLanguage === "ar"
            ? "خطأ في تعيين المساعد."
            : "Error assigning assistant.",
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
        title:
          currentLanguage === "fr"
            ? "Statut mis à jour."
            : currentLanguage === "ar"
            ? "تم تحديث الحالة."
            : "Status updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (err) => {
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur lors de la mise à jour du statut."
            : currentLanguage === "ar"
            ? "خطأ في تحديث الحالة."
            : "Error updating status.",
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
        {currentLanguage === "fr"
          ? "Erreur lors de la récupération des détails du client : "
          : currentLanguage === "ar"
          ? "خطأ في جلب تفاصيل العميل: "
          : "Error fetching client details: "}
        {error?.response?.data?.message ||
          error?.message ||
          (currentLanguage === "fr"
            ? "Erreur inconnue"
            : currentLanguage === "ar"
            ? "خطأ غير معروف"
            : "Unknown error")}
      </Alert>
    );
  }

  if (!client) {
    return (
      <Alert status="warning">
        <AlertIcon />
        {currentLanguage === "fr"
          ? "Client non trouvé."
          : currentLanguage === "ar"
          ? "العميل غير موجود."
          : "Client not found."}
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
        {currentLanguage === "fr"
          ? "Retour à la liste"
          : currentLanguage === "ar"
          ? "العودة إلى القائمة"
          : "Back to List"}
      </Button>
      <Heading as="h1" size="xl" mb={6}>
        {client.name}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Card>
          <CardHeader>
            <Heading size="md">
              {currentLanguage === "fr"
                ? "Détails du client"
                : currentLanguage === "ar"
                ? "تفاصيل العميل"
                : "Client Details"}
            </Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<Divider />} spacing={4}>
              <HStack>
                <Text fontWeight="bold">
                  {currentLanguage === "fr"
                    ? "Email :"
                    : currentLanguage === "ar"
                    ? "البريد الإلكتروني:"
                    : "Email:"}
                </Text>
                <Text>{client.email}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">
                  {currentLanguage === "fr"
                    ? "Téléphone :"
                    : currentLanguage === "ar"
                    ? "الهاتف:"
                    : "Phone:"}
                </Text>
                <Text>{client.phone}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">
                  {currentLanguage === "fr"
                    ? "Statut :"
                    : currentLanguage === "ar"
                    ? "الحالة:"
                    : "Status:"}
                </Text>
                <Tag size="md" colorScheme={getStatusColor(client.status)}>
                  {client.status}
                </Tag>
              </HStack>
              <HStack>
                <Text fontWeight="bold">
                  {currentLanguage === "fr"
                    ? "Responsable :"
                    : currentLanguage === "ar"
                    ? "المدير:"
                    : "Manager:"}
                </Text>
                <Text>
                  {client.manager?.firstName} {client.manager?.lastName}
                </Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">
                  {currentLanguage === "fr"
                    ? "Assistant :"
                    : currentLanguage === "ar"
                    ? "المساعد:"
                    : "Assistant:"}
                </Text>
                <Text>
                  {client.assistant
                    ? `${client.assistant.firstName} ${client.assistant.lastName}`
                    : currentLanguage === "fr"
                    ? "N/A"
                    : currentLanguage === "ar"
                    ? "غير متاح"
                    : "N/A"}
                </Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold">
                  {currentLanguage === "fr"
                    ? "Créé le :"
                    : currentLanguage === "ar"
                    ? "أنشئ في:"
                    : "Created At:"}
                </Text>
                <Text>{format(new Date(client.createdAt), "PPP p")}</Text>
              </HStack>
            </Stack>
          </CardBody>
        </Card>

        <VStack spacing={6} align="stretch">
          {canUserCommentOrUpdate && (
            <Card>
              <CardHeader>
                <Heading size="md">
                  {currentLanguage === "fr"
                    ? "Mettre à jour le statut"
                    : currentLanguage === "ar"
                    ? "تحديث الحالة"
                    : "Update Status"}
                </Heading>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <FormLabel htmlFor="status">
                    {currentLanguage === "fr"
                      ? "Statut du client"
                      : currentLanguage === "ar"
                      ? "حالة العميل"
                      : "Client Status"}
                  </FormLabel>
                  <Select
                    id="status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    isDisabled={
                      updateStatusMutation.isLoading || !canUserCommentOrUpdate
                    }
                  >
                    <option value="intéressé">
                      {currentLanguage === "fr"
                        ? "Intéressé"
                        : currentLanguage === "ar"
                        ? "مهتم"
                        : "Interested"}
                    </option>
                    <option value="pas intéressé">
                      {currentLanguage === "fr"
                        ? "Pas intéressé"
                        : currentLanguage === "ar"
                        ? "غير مهتم"
                        : "Not Interested"}
                    </option>
                    <option value="injoignable">
                      {currentLanguage === "fr"
                        ? "Injoignable"
                        : currentLanguage === "ar"
                        ? "لا يمكن الوصول إليه"
                        : "Unreachable"}
                    </option>
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
              {currentLanguage === "fr"
                ? "M'assigner comme assistant"
                : currentLanguage === "ar"
                ? "عين نفسي كمساعد"
                : "Assign Myself as Assistant"}
            </Button>
          )}
        </VStack>
      </SimpleGrid>

      <Box mt={10}>
        <Heading size="lg" mb={4}>
          {currentLanguage === "fr"
            ? "Commentaires"
            : currentLanguage === "ar"
            ? "تعليقات"
            : "Comments"}
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
              <FormLabel htmlFor="comment">
                {currentLanguage === "fr"
                  ? "Ajouter un commentaire"
                  : currentLanguage === "ar"
                  ? "إضافة تعليق"
                  : "Add a Comment"}
              </FormLabel>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  currentLanguage === "fr"
                    ? "Tapez votre commentaire ici..."
                    : currentLanguage === "ar"
                    ? "اكتب تعليقك هنا..."
                    : "Type your comment here..."
                }
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
              {currentLanguage === "fr"
                ? "Soumettre le commentaire"
                : currentLanguage === "ar"
                ? "إرسال التعليق"
                : "Submit Comment"}
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
          <Text>
            {currentLanguage === "fr"
              ? "Aucun commentaire pour le moment."
              : currentLanguage === "ar"
              ? "لا توجد تعليقات حتى الآن."
              : "No comments yet."}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default PotentialClientDetailView;
