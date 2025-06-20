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
  const currentLanguage = useSelector((state) => state.language.language); // Get current language

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
        {currentLanguage === "fr"
          ? "Erreur lors de la récupération des clients potentiels : "
          : currentLanguage === "ar"
          ? "خطأ في جلب العملاء المحتملين: "
          : "Error fetching potential clients: "}
        {error?.message ||
          (currentLanguage === "fr"
            ? "Erreur inconnue"
            : currentLanguage === "ar"
            ? "خطأ غير معروف"
            : "Unknown error")}
      </Alert>
    );
  }

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">
          {currentLanguage === "fr"
            ? "Clients Potentiels"
            : currentLanguage === "ar"
            ? "العملاء المحتملون"
            : "Potential Clients"}
        </Heading>
        {(userRole === "admin" || userRole === "coordinator") && (
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={() => navigate("/dashboard/potential-clients/create")}
          >
            {currentLanguage === "fr"
              ? "Créer un nouveau client"
              : currentLanguage === "ar"
              ? "إنشاء عميل جديد"
              : "Create New Client"}
          </Button>
        )}
      </Flex>

      {clients && clients.length > 0 ? (
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>
                {currentLanguage === "fr"
                  ? "Nom"
                  : currentLanguage === "ar"
                  ? "الاسم"
                  : "Name"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Téléphone"
                  : currentLanguage === "ar"
                  ? "الهاتف"
                  : "Phone"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Email"
                  : currentLanguage === "ar"
                  ? "البريد الإلكتروني"
                  : "Email"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Statut"
                  : currentLanguage === "ar"
                  ? "الحالة"
                  : "Status"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Responsable"
                  : currentLanguage === "ar"
                  ? "المدير"
                  : "Manager"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Assistant"
                  : currentLanguage === "ar"
                  ? "المساعد"
                  : "Assistant"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Commentaires"
                  : currentLanguage === "ar"
                  ? "التعليقات"
                  : "Comments"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Actions"
                  : currentLanguage === "ar"
                  ? "الإجراءات"
                  : "Actions"}
              </Th>
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
                    : currentLanguage === "fr"
                    ? "N/A"
                    : currentLanguage === "ar"
                    ? "غير متاح"
                    : "N/A"}
                </Td>
                <Td>
                  {client.assistant
                    ? `${client.assistant.firstName} ${client.assistant.lastName}`
                    : currentLanguage === "fr"
                    ? "N/A"
                    : currentLanguage === "ar"
                    ? "غير متاح"
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
                    {currentLanguage === "fr"
                      ? "Voir les détails"
                      : currentLanguage === "ar"
                      ? "عرض التفاصيل"
                      : "View Details"}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>
          {currentLanguage === "fr"
            ? "Aucun client potentiel trouvé."
            : currentLanguage === "ar"
            ? "لم يتم العثور على عملاء محتملين."
            : "No potential clients found."}
        </Text>
      )}
    </Box>
  );
};

export default PotentialClientsListView;
