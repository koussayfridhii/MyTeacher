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
// import { t } from "../../utils/translations"; // Removing this import

const Parents = () => {
  const toast = useToast();
  const { user } = useSelector((state) => ({
    user: state.user.user,
  }));
  const currentLanguage = useSelector((state) => state.language.language); // Renamed language to currentLanguage

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
            title:
              currentLanguage === "fr"
                ? "Parent Supprimé"
                : currentLanguage === "ar"
                ? "تم حذف ولي الأمر"
                : "Parent Deleted",
            description:
              currentLanguage === "fr"
                ? "Le parent a été supprimé avec succès."
                : currentLanguage === "ar"
                ? "تم حذف ولي الأمر بنجاح."
                : "Parent has been successfully deleted.",
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
            title:
              currentLanguage === "fr"
                ? "Erreur de Suppression du Parent"
                : currentLanguage === "ar"
                ? "خطأ في حذف ولي الأمر"
                : "Error Deleting Parent",
            description:
              error?.response?.data?.message ||
              error.message ||
              (currentLanguage === "fr"
                ? "Une erreur s'est produite lors de la suppression du parent."
                : currentLanguage === "ar"
                ? "حدث خطأ أثناء حذف ولي الأمر."
                : "An error occurred while deleting the parent."),
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
            (currentLanguage === "fr"
              ? "Erreur lors de la récupération des données des parents."
              : currentLanguage === "ar"
              ? "خطأ في جلب بيانات أولياء الأمور."
              : "Error fetching parents data.")}
        </Text>
      </Center>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>
        {currentLanguage === "fr"
          ? "Liste des Parents"
          : currentLanguage === "ar"
          ? "قائمة أولياء الأمور"
          : "Parents List"}
      </Heading>

      <HStack mb={4} spacing={4}>
        <Input
          placeholder={
            currentLanguage === "fr"
              ? "Rechercher par nom..."
              : currentLanguage === "ar"
              ? "البحث بالاسم..."
              : "Search by name..."
          }
          value={searchTerm}
          onChange={handleSearchChange}
          width={{ base: "100%", md: "300px" }}
        />
        <Button
          leftIcon={<FiPlus />}
          colorScheme="teal"
          onClick={onCreateModalOpen}
        >
          {currentLanguage === "fr"
            ? "Créer un Parent"
            : currentLanguage === "ar"
            ? "إنشاء ولي أمر"
            : "Create Parent"}
        </Button>
      </HStack>

      <CreateParentModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
      />
      {selectedParent && (
        <EditParentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            onEditModalClose();
            setSelectedParent(null);
          }}
          parentData={selectedParent}
        />
      )}

      <Box overflowX="auto">
        <Table variant="simple">
          {/* Removed isLoading overlay on table, as main isLoading handles initial fetch */}
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Nom Complet"
                  : currentLanguage === "ar"
                  ? "الاسم الكامل"
                  : "Full Name"}
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
                  ? "Numéro de Mobile"
                  : currentLanguage === "ar"
                  ? "رقم الجوال"
                  : "Mobile Number"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Nb. d'Étudiants"
                  : currentLanguage === "ar"
                  ? "عدد الطلاب"
                  : "No. of Students"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Coordinateur"
                  : currentLanguage === "ar"
                  ? "المنسق"
                  : "Coordinator"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Assigné"
                  : currentLanguage === "ar"
                  ? "مُعين"
                  : "Assigned"}
              </Th>
              <Th>
                {currentLanguage === "fr"
                  ? "Soldes Totaux des Étudiants"
                  : currentLanguage === "ar"
                  ? "إجمالي أرصدة الطلاب"
                  : "Total Student Balances"}
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
                    : currentLanguage === "fr"
                    ? "N/A"
                    : currentLanguage === "ar"
                    ? "غير مُحدد"
                    : "N/A"}
                </Td>
                <Td>{parent.isAssigned ? "✔️" : "❌"}</Td>
                <Td>{parent.totalStudentBalances?.toFixed(2) || "0.00"}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FiEdit />}
                      onClick={() => handleEditClick(parent)}
                    >
                      {currentLanguage === "fr"
                        ? "Modifier"
                        : currentLanguage === "ar"
                        ? "تعديل"
                        : "Edit"}
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
                      {currentLanguage === "fr"
                        ? "Supprimer"
                        : currentLanguage === "ar"
                        ? "حذف"
                        : "Delete"}
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
                ? currentLanguage === "fr"
                  ? "Aucun parent trouvé correspondant à votre recherche."
                  : currentLanguage === "ar"
                  ? "لم يتم العثور على أولياء أمور مطابقين لبحثك."
                  : "No parents found matching your search."
                : currentLanguage === "fr"
                ? "Aucun parent disponible à afficher."
                : currentLanguage === "ar"
                ? "لا يوجد أولياء أمور لعرضهم."
                : "No parents available to display."}
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
              {currentLanguage === "fr"
                ? "Précédent"
                : currentLanguage === "ar"
                ? "السابق"
                : "Previous"}
            </Button>
            <Text>
              {currentLanguage === "fr"
                ? "Page"
                : currentLanguage === "ar"
                ? "صفحة"
                : "Page"}{" "}
              {currentPage}{" "}
              {currentLanguage === "fr"
                ? "de"
                : currentLanguage === "ar"
                ? "من"
                : "of"}{" "}
              {totalPages || 1}
            </Text>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages || totalPages === 0}
            >
              {currentLanguage === "fr"
                ? "Suivant"
                : currentLanguage === "ar"
                ? "التالي"
                : "Next"}
            </Button>
            <Select
              width="120px"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>
                5
                {currentLanguage === "fr"
                  ? " par page"
                  : currentLanguage === "ar"
                  ? " لكل صفحة"
                  : " per page"}
              </option>
              <option value={10}>
                10
                {currentLanguage === "fr"
                  ? " par page"
                  : currentLanguage === "ar"
                  ? " لكل صفحة"
                  : " per page"}
              </option>
              <option value={20}>
                20
                {currentLanguage === "fr"
                  ? " par page"
                  : currentLanguage === "ar"
                  ? " لكل صفحة"
                  : " per page"}
              </option>
              <option value={50}>
                50
                {currentLanguage === "fr"
                  ? " par page"
                  : currentLanguage === "ar"
                  ? " لكل صفحة"
                  : " per page"}
              </option>
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
              {currentLanguage === "fr"
                ? "Supprimer le Parent"
                : currentLanguage === "ar"
                ? "حذف ولي الأمر"
                : "Delete Parent"}
            </AlertDialogHeader>
            <AlertDialogBody>
              {currentLanguage === "fr"
                ? "Êtes-vous sûr de vouloir supprimer"
                : currentLanguage === "ar"
                ? "هل أنت متأكد أنك تريد حذف"
                : "Are you sure you want to delete"}{" "}
              {selectedParent?.fullName}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                {currentLanguage === "fr"
                  ? "Annuler"
                  : currentLanguage === "ar"
                  ? "إلغاء"
                  : "Cancel"}
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={isDeleting}
              >
                {currentLanguage === "fr"
                  ? "Supprimer"
                  : currentLanguage === "ar"
                  ? "حذف"
                  : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default withAuthorization(Parents, ["admin", "coordinator"]);
