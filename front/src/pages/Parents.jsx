import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  HStack,
  Text,
  Spinner,
  Center,
  Select,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { useGetParents, useDeleteParent } from "../hooks/useParents"; // Updated
import CreateParentModal from "../components/CreateParentModal";
import EditParentModal from "../components/EditParentModal";
import { withAuthorization } from "../HOC/Protect.jsx"; // Corrected import
import { t } from "../utils/translations";

const Parents = () => {
  const toast = useToast();
  const { user } = useSelector((state) => ({
    user: state.user.user,
  }));
  const language = useSelector((state) => state.language.language);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Or make this a state if user can change it
  const [selectedParent, setSelectedParent] = useState(null);

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onDeleteAlertOpen,
    onClose: onDeleteAlertClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  // Fetch all parents - useGetParents now takes no arguments
  const {
    data: allParentsData,
    isLoading,
    isError,
    error: fetchError,
  } = useGetParents();
  const { mutate: deleteParent, isLoading: isDeleting } = useDeleteParent();

  // Client-side filtering
  const filteredParents = useMemo(() => {
    let parentsToFilter = allParentsData || [];
    // Assuming allParentsData is the array of parents. If it's an object like { data: [...] }, use allParentsData.data
    // Based on useGetParents simplification, allParentsData should be the array.
    if (!Array.isArray(parentsToFilter)) {
      // Safeguard if API response structure is not just an array
      parentsToFilter = parentsToFilter.data || []; // Common pattern for APIs returning { data: [], total: ... }
    }
    if (!Array.isArray(parentsToFilter)) return []; // Ensure it's an array before filtering

    if (!searchTerm) return parentsToFilter;
    return parentsToFilter.filter(
      (parent) =>
        (parent.fullName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (parent.email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (parent.mobileNumber?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
    );
  }, [allParentsData, searchTerm]);

  // Client-side pagination
  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredParents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page on items per page change
  };

  const handleDeleteClick = (parent) => {
    setSelectedParent(parent);
    onDeleteAlertOpen();
  };

  const confirmDelete = () => {
    if (selectedParent) {
      deleteParent(selectedParent._id, {
        onSuccess: () => {
          toast({
            title: t("parentDeletedSuccessTitle", language),
            description: t("parentDeletedSuccessDesc", language),
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onDeleteAlertClose();
          setSelectedParent(null);
          // No need to invalidate 'parents' query if we are optimistic or refetch on focus/mount
        },
        onError: (error) => {
          toast({
            title: t("errorDeletingParentTitle", language),
            description:
              error?.response?.data?.message ||
              error.message ||
              t("errorDeletingParentDesc", language),
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          onDeleteAlertClose();
        },
      });
    }
  };

  const handleEditClick = (parent) => {
    setSelectedParent(parent);
    onEditModalOpen();
  };

  if (isLoading) {
    // Show spinner only on initial load of all parents
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (isError) {
    // Show error only if initial fetch of all parents fails
    return (
      <Center h="100vh">
        <Text color="red.500">
          {fetchError?.response?.data?.message ||
            fetchError?.message ||
            t("errorFetchingParents", language)}
        </Text>
      </Center>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>{t("parentsList", language)}</Heading>

      <HStack mb={4} spacing={4}>
        <Input
          placeholder={t("searchByName", language)} // Consider a more generic placeholder if searching more fields
          value={searchTerm}
          onChange={handleSearchChange}
          width={{ base: "100%", md: "300px" }}
        />
        <Button
          leftIcon={<FiPlus />}
          colorScheme="teal"
          onClick={onCreateModalOpen}
        >
          {t("createParent", language)}
        </Button>
      </HStack>

      <CreateParentModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        language={language}
      />
      {selectedParent && (
        <EditParentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            onEditModalClose();
            setSelectedParent(null);
          }}
          parentData={selectedParent}
          language={language}
        />
      )}

      <Box overflowX="auto">
        <Table variant="simple">
          {/* Removed isLoading overlay on table, as main isLoading handles initial fetch */}
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>{t("fullName", language)}</Th>
              <Th>{t("email", language)}</Th>
              <Th>{t("mobileNumber", language)}</Th>
              <Th>{t("numberOfStudents", language)}</Th>
              <Th>{t("coordinator", language)}</Th>
              <Th>{t("isAssigned", language)}</Th>
              <Th>{t("actions", language)}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedParents.map((parent, index) => (
              <Tr key={parent._id}>
                <Td>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                <Td>{parent.fullName}</Td>
                <Td>{parent.email}</Td>
                <Td>{parent.mobileNumber}</Td>
                <Td>{parent.students?.length || 0}</Td>
                <Td>
                  {parent.coordinator
                    ? `${parent.coordinator.firstName} ${parent.coordinator.lastName}`
                    : t("notAssigned", language)}
                </Td>
                <Td>{parent.isAssigned ? "✔️" : "❌"}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FiEdit />}
                      onClick={() => handleEditClick(parent)}
                    >
                      {t("edit", language)}
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiTrash2 />}
                      colorScheme="red"
                      onClick={() => handleDeleteClick(parent)}
                      isLoading={
                        isDeleting && selectedParent?._id === parent._id
                      }
                    >
                      {t("delete", language)}
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {paginatedParents.length === 0 &&
        !isLoading && ( // Show if no parents after filtering or initially
          <Center my={10}>
            <Text>
              {searchTerm
                ? t("noParentsFoundSearch", language)
                : t("noParentsAvailable", language)}
            </Text>
          </Center>
        )}

      {filteredParents.length > itemsPerPage &&
        totalPages > 1 && ( // Show pagination if there are more items than fit on one page
          <HStack mt={6} spacing={2} justify="center">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            >
              {t("previous", language)}
            </Button>
            <Text>
              {t("page", language)} {currentPage} {t("of", language)}{" "}
              {totalPages || 1}
            </Text>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages || totalPages === 0}
            >
              {t("next", language)}
            </Button>
            <Select
              width="120px"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5 {t("perPage", language)}</option>
              <option value={10}>10 {t("perPage", language)}</option>
              <option value={20}>20 {t("perPage", language)}</option>
              <option value={50}>50 {t("perPage", language)}</option>
            </Select>
          </HStack>
        )}

      {/* Delete Confirmation Dialog is unchanged and should work */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t("deleteParentTitle", language)}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t("deleteParentConfirmation", language)}{" "}
              {selectedParent?.fullName}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                {t("cancel", language)}
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={isDeleting}
              >
                {t("delete", language)}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default withAuthorization(Parents, ["admin", "coordinator"]);
