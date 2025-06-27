import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Input,
  Flex,
  Select,
  Tag,
  Text,
  Tooltip,
  HStack,
  VStack,
  TagLabel,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import apiClient from "../hooks/apiClient";
import { t } from "../utils/translations";
import CreateGroupModal from "../components/CreateGroupModal";
import AddStudentToGroupModal from "../components/AddStudentToGroupModal";
import { withAuthorization } from "../HOC/Protect";

const GroupsPageComponent = () => {
  // Renamed to avoid conflict before HOC
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isAddStudentOpen,
    onOpen: onAddStudentOpen,
    onClose: onAddStudentClose,
  } = useDisclosure();

  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupForStudentAdd, setSelectedGroupForStudentAdd] =
    useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user); // to get current user for createdBy

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/groups");
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("errorFetchingGroups", language, "en", {
            error: "Failed to fetch groups",
          })
      );
      console.error("Error fetching groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateModalOpen = () => {
    setEditingGroup(null);
    onCreateOpen();
  };

  const handleEditModalOpen = (group) => {
    setEditingGroup(group);
    onCreateOpen();
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm(t("deleteGroupConfirmation", language, "en"))) {
      try {
        await apiClient.delete(`/groups/${groupId}`);
        fetchGroups(); // Refresh list
        // Add toast notification for success
      } catch (err) {
        setError(
          err.response?.data?.message ||
            t("errorDeletingGroup", language, "en", {
              error: "Failed to delete group",
            })
        );
        // Add toast notification for error
      }
    }
  };

  const handleAddStudentModalOpen = (group) => {
    setSelectedGroupForStudentAdd(group);
    onAddStudentOpen();
  };

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        group.name.toLowerCase().includes(searchLower) ||
        group.subject.toLowerCase().includes(searchLower) ||
        group.level.toLowerCase().includes(searchLower) ||
        (group.teacher?.firstName &&
          group.teacher.firstName.toLowerCase().includes(searchLower)) ||
        (group.teacher?.lastName &&
          group.teacher.lastName.toLowerCase().includes(searchLower))
      );
    });
  }, [groups, searchTerm]);

  const sortedGroups = useMemo(() => {
    let sortableItems = [...filteredGroups];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "teacher") {
          aValue = `${a.teacher?.firstName || ""} ${
            a.teacher?.lastName || ""
          }`.toLowerCase();
          bValue = `${b.teacher?.firstName || ""} ${
            b.teacher?.lastName || ""
          }`.toLowerCase();
        } else if (sortConfig.key === "plan") {
          aValue = a.plan?.name?.toLowerCase();
          bValue = b.plan?.name?.toLowerCase();
        } else if (sortConfig.key === "createdBy") {
          aValue = `${a.createdBy?.firstName || ""} ${
            a.createdBy?.lastName || ""
          }`.toLowerCase();
          bValue = `${b.createdBy?.firstName || ""} ${
            b.createdBy?.lastName || ""
          }`.toLowerCase();
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredGroups, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " 🔼" : " 🔽";
    }
    return "";
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading as="h1" size="xl">
          {language === "en" ? "Manage Groups" : "Gérer les Groupes"}
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={handleCreateModalOpen}
        >
          {language === "en" ? "Create Group" : "Créer un Groupe"}
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Input
        placeholder={
          language === "en"
            ? "Search groups (name, subject, level, teacher)..."
            : "Rechercher des groupes (nom, matière, niveau, professeur)..."
        }
        mb={5}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        width={{ base: "100%", md: "50%" }}
      />

      {sortedGroups.length === 0 && !isLoading ? (
        <Text fontSize="lg" textAlign="center" mt={10}>
          {language === "en" ? "No groups found." : "Aucun groupe trouvé."}
        </Text>
      ) : (
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th cursor="pointer" onClick={() => requestSort("name")}>
                {language === "en" ? "Name" : "Nom"}
                {getSortIndicator("name")}
              </Th>
              <Th cursor="pointer" onClick={() => requestSort("subject")}>
                {language === "en" ? "Subject" : "Matière"}
                {getSortIndicator("subject")}
              </Th>
              <Th cursor="pointer" onClick={() => requestSort("teacher")}>
                {language === "en" ? "Teacher" : "Professeur"}
                {getSortIndicator("teacher")}
              </Th>
              <Th cursor="pointer" onClick={() => requestSort("level")}>
                {language === "en" ? "Level" : "Niveau"}
                {getSortIndicator("level")}
              </Th>
              <Th cursor="pointer" onClick={() => requestSort("plan")}>
                {language === "en" ? "Plan" : "Plan"}
                {getSortIndicator("plan")}
              </Th>
              <Th>{language === "en" ? "Students" : "Étudiants"}</Th>
              <Th cursor="pointer" onClick={() => requestSort("createdBy")}>
                {language === "en" ? "Created By" : "Créé par"}
                {getSortIndicator("createdBy")}
              </Th>
              <Th>{language === "en" ? "Actions" : "Actions"}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedGroups.map((group) => {
              const canModify =
                user.role === "admin" ||
                (user.role === "coordinator" &&
                  group.createdBy &&
                  group.createdBy._id === user._id);
              return (
                <Tr key={group._id}>
                  <Td>{group.name}</Td>
                  <Td>{group.subject}</Td>
                  <Td>{`${group.teacher?.firstName || ""} ${
                    group.teacher?.lastName || ""
                  }`}</Td>
                  <Td>{group.level}</Td>
                  <Td>
                    <Tag
                      colorScheme={group.plan?.color?.toLowerCase() || "gray"}
                    >
                      {group.plan?.name} ({group.plan?.numberOfStudents} max)
                    </Tag>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm">
                        {group.students?.length || 0} /{" "}
                        {group.plan?.numberOfStudents}
                        <Tooltip label={t("addStudentToGroup", language)}>
                          <IconButton
                            icon={<AddIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="green"
                            ml={1}
                            onClick={() => handleAddStudentModalOpen(group)}
                            aria-label={t("addStudentToGroup", language)}
                          />
                        </Tooltip>
                      </Text>
                      {group.students && group.students.length > 0 && (
                        <Tooltip
                          label={group.students
                            .map((s) => `${s.firstName} ${s.lastName}`)
                            .join(", ")}
                          aria-label="Student list"
                          placement="top-start"
                        >
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            isTruncated
                            maxWidth="150px"
                          >
                            {group.students
                              .map((s) => `${s.firstName} ${s.lastName}`)
                              .join(", ")}
                          </Text>
                        </Tooltip>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    {group.createdBy
                      ? `${group.createdBy.firstName} ${group.createdBy.lastName}`
                      : "N/A"}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {/* <Tooltip label={language === "en" ? "View Details" : "Voir les détails"}>
                    <IconButton
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {}} // Add view details functionality
                    />
                </Tooltip> */}
                      {canModify && (
                        <>
                          <Tooltip
                            label={
                              language === "en"
                                ? "Edit Group"
                                : "Modifier le Groupe"
                            }
                          >
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleEditModalOpen(group)}
                              aria-label={t("editGroup", language)}
                            />
                          </Tooltip>
                          <Tooltip
                            label={
                              language === "en"
                                ? "Delete Group"
                                : "Supprimer le Groupe"
                            }
                          >
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteGroup(group._id)}
                              aria-label={t("deleteGroup", language)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        fetchGroups={fetchGroups}
        editingGroup={editingGroup}
        currentUser={user}
      />

      {selectedGroupForStudentAdd && (
        <AddStudentToGroupModal
          isOpen={isAddStudentOpen}
          onClose={onAddStudentClose}
          group={selectedGroupForStudentAdd}
          fetchGroups={fetchGroups}
        />
      )}
    </Box>
  );
};

const GroupsPage = withAuthorization(GroupsPageComponent, [
  "admin",
  "coordinator",
]);

export default GroupsPage;
