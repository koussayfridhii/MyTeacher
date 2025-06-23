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
  Icon,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useMemo, useState } from "react";

const fetchPotentialClients = async () => {
  const { data } = await apiClient.get("/potential-clients");
  return data;
};

const PotentialClientsListView = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user); // Accessing user from Redux store
  const userRole = user?.role;
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const {
    data: clientsData, // Renamed to avoid conflict
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["potentialClients"],
    queryFn: fetchPotentialClients,
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedClients = useMemo(() => {
    if (!clientsData) return [];
    let sorted = [...clientsData];
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aValue, bValue;
        switch (sortColumn) {
          case "name":
            aValue = a.name || "";
            bValue = b.name || "";
            break;
          case "phone":
            aValue = a.phone || "";
            bValue = b.phone || "";
            break;
          case "email":
            aValue = a.email || "";
            bValue = b.email || "";
            break;
          case "status":
            aValue = a.status || "";
            bValue = b.status || "";
            break;
          case "manager":
            aValue = a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : "";
            bValue = b.manager ? `${b.manager.firstName} ${b.manager.lastName}` : "";
            break;
          case "assistant":
            aValue = a.assistant ? `${a.assistant.firstName} ${a.assistant.lastName}` : "";
            bValue = b.assistant ? `${b.assistant.firstName} ${b.assistant.lastName}` : "";
            break;
          case "comments":
            aValue = a.commentaires?.length || 0;
            bValue = b.commentaires?.length || 0;
            break;
          default:
            aValue = a[sortColumn];
            bValue = b[sortColumn];
        }

        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
      });
    }
    return sorted;
  }, [clientsData, sortColumn, sortDirection]);

  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <Icon as={FaSortUp} /> : <Icon as={FaSortDown} />;
    }
    return <Icon as={FaSort} color="gray.400" />;
  };


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

      {sortedClients && sortedClients.length > 0 ? (
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th onClick={() => handleSort("name")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Nom"
                  : currentLanguage === "ar"
                  ? "الاسم"
                  : "Name"} {renderSortIcon("name")}
              </Th>
              <Th onClick={() => handleSort("phone")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Téléphone"
                  : currentLanguage === "ar"
                  ? "الهاتف"
                  : "Phone"} {renderSortIcon("phone")}
              </Th>
              <Th onClick={() => handleSort("email")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Email"
                  : currentLanguage === "ar"
                  ? "البريد الإلكتروني"
                  : "Email"} {renderSortIcon("email")}
              </Th>
              <Th onClick={() => handleSort("status")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Statut"
                  : currentLanguage === "ar"
                  ? "الحالة"
                  : "Status"} {renderSortIcon("status")}
              </Th>
              <Th onClick={() => handleSort("manager")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Responsable"
                  : currentLanguage === "ar"
                  ? "المدير"
                  : "Manager"} {renderSortIcon("manager")}
              </Th>
              <Th onClick={() => handleSort("assistant")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Assistant"
                  : currentLanguage === "ar"
                  ? "المساعد"
                  : "Assistant"} {renderSortIcon("assistant")}
              </Th>
              <Th onClick={() => handleSort("comments")} cursor="pointer">
                {currentLanguage === "fr"
                  ? "Commentaires"
                  : currentLanguage === "ar"
                  ? "التعليقات"
                  : "Comments"} {renderSortIcon("comments")}
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
            {sortedClients.map((client) => (
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
