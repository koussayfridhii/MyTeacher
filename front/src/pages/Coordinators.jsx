import React, { useState, useMemo } from "react";
import {
  Box,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
  HStack, // Import useToast
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useCoordinators } from "../hooks/useCoordinators";
import { withAuthorization } from "../HOC/Protect";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSelector } from "react-redux"; // Import useSelector

const Coordinators = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure(); // Renamed for create modal
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure(); // For edit modal
  const toast = useToast(); // For notifications

  // State for confirmation modals and selected coordinator for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null); // Changed from selectedCoordinatorId to store the whole object
  const [isDisapproving, setIsDisapproving] = useState(false); // To know if we are disapproving or approving

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm(); // Renamed for create form

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue, // To set form values for the edit modal
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm(); // For edit form

  const {
    data: allCoordinators = [],
    isLoading,
    isError,
    refetch,
  } = useCoordinators();

  // Front-end filtering and sorting
  const coordinators = useMemo(() => {
    const filtered = allCoordinators.filter((coord) => {
      const term = search.toLowerCase();
      return (
        coord.firstName.toLowerCase().includes(term) ||
        coord.lastName.toLowerCase().includes(term) ||
        coord.email.toLowerCase().includes(term) ||
        coord.mobileNumber.toLowerCase().includes(term)
      );
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [allCoordinators, search, sortField, sortOrder]);

  const openEditModal = (coordinator) => {
    setSelectedCoordinator(coordinator);
    // Pre-fill form with coordinator data
    setEditValue("firstName", coordinator.firstName);
    setEditValue("lastName", coordinator.lastName);
    setEditValue("email", coordinator.email);
    setEditValue("mobileNumber", coordinator.mobileNumber);
    setEditValue("rib", coordinator.rib || "");
    setEditValue("base_salary", coordinator.base_salary !== null && coordinator.base_salary !== undefined ? coordinator.base_salary : 0);
    onEditModalOpen();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  const token = localStorage.getItem("token");

  const onCreateSubmit = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/create`,
        {
          ...data,
          role: "coordinator",
          // base_salary will be handled by backend if included in data
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetCreate();
      onCreateModalClose();
      refetch();
      toast({ title: "Coordinator created.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      console.error(err);
      toast({ title: "Error creating coordinator.", description: err.response?.data?.error || "Server error", status: "error", duration: 5000, isClosable: true });
    }
  };

  const onEditSubmit = async (data) => {
    if (!selectedCoordinator) return;
    try {
      // Ensure base_salary is a number or null
      const payload = { ...data };
      if (payload.base_salary === "" || payload.base_salary === undefined || payload.base_salary === null) {
        payload.base_salary = 0;
      } else {
        payload.base_salary = Number(payload.base_salary);
        if (isNaN(payload.base_salary) || payload.base_salary < 0) {
            toast({ title: "Invalid Base Salary", description: "Base salary must be a non-negative number.", status: "error", duration: 5000, isClosable: true });
            return;
        }
      }
      // Remove password if not changed (assuming password field is empty if not changing)
      if (!payload.password) {
        delete payload.password;
      }


      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${selectedCoordinator._id}`,
        payload, // Send all editable fields
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetEdit();
      onEditModalClose();
      refetch();
      toast({ title: "Coordinator updated.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      console.error(err);
      toast({ title: "Error updating coordinator.", description: err.response?.data?.error || "Server error", status: "error", duration: 5000, isClosable: true });
    }
  };

  const openDeleteModal = (coord) => {
    setSelectedCoordinator(coord);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedCoordinator(null);
    setIsDeleteModalOpen(false);
  };

  const openApproveModal = (coord, currentlyApproved) => {
    setSelectedCoordinator(coord);
    setIsDisapproving(currentlyApproved); // If currently approved, action is to disapprove
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setSelectedCoordinator(null);
    setIsApproveModalOpen(false);
  };

  const handleDeleteCoordinator = async () => {
    if (!selectedCoordinator || !selectedCoordinator._id) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/${selectedCoordinator._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title:
          currentLanguage === "fr"
            ? "Coordinateur supprimé"
            : currentLanguage === "ar"
            ? "تم حذف المنسق"
            : "Coordinator Deleted",
        description:
          currentLanguage === "fr"
            ? "Le coordinateur a été supprimé avec succès."
            : currentLanguage === "ar"
            ? "تم حذف المنسق بنجاح."
            : "The coordinator has been successfully deleted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur de suppression"
            : currentLanguage === "ar"
            ? "خطأ في الحذف"
            : "Deletion Error",
        description:
          err.response?.data?.error ||
          (currentLanguage === "fr"
            ? "Impossible de supprimer le coordinateur."
            : currentLanguage === "ar"
            ? "فشل حذف المنسق."
            : "Failed to delete coordinator."),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleApproveCoordinator = async () => {
    if (!selectedCoordinator || !selectedCoordinator._id) return;
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/users/approve/${selectedCoordinator._id}`,
        { approve: !isDisapproving }, // Send the opposite of current disapproval state
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: isDisapproving
          ? currentLanguage === "fr"
            ? "Coordinateur désapprouvé"
            : currentLanguage === "ar"
            ? "تم عدم الموافقة على المنسق"
            : "Coordinator Disapproved"
          : currentLanguage === "fr"
          ? "Coordinateur approuvé"
          : currentLanguage === "ar"
          ? "تمت الموافقة على المنسق"
          : "Coordinator Approved",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      refetch();
      closeApproveModal();
    } catch (err) {
      console.error(err);
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur de mise à jour"
            : currentLanguage === "ar"
            ? "خطأ في التحديث"
            : "Update Error",
        description:
          err.response?.data?.error ||
          (currentLanguage === "fr"
            ? "Impossible de mettre à jour le statut du coordinateur."
            : currentLanguage === "ar"
            ? "فشل تحديث حالة المنسق."
            : "Failed to update coordinator status."),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading)
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  if (isError)
    return (
      <Center h="100%">
        <Text fontSize="lg" color="red.500">
          {currentLanguage === "fr"
            ? "Échec du chargement des coordinateurs."
            : currentLanguage === "ar"
            ? "فشل تحميل المنسقين."
            : "Failed to load coordinators."}
        </Text>
      </Center>
    );

  return (
    <Box p={4} borderWidth="1px" borderColor="primary" borderRadius="md">
      <Button mb={4} bg="primary" color="white" onClick={onCreateModalOpen}>
        {currentLanguage === "fr"
          ? "Créer un coordinateur"
          : currentLanguage === "ar"
          ? "إنشاء منسق"
          : "Create Coordinator"}
      </Button>
      <Input
        placeholder={
          currentLanguage === "fr"
            ? "Rechercher des coordinateurs"
            : currentLanguage === "ar"
            ? "البحث عن المنسقين"
            : "Search coordinators"
        }
        mb={4}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        focusBorderColor="primary"
      />

      <Table variant="simple" size="md">
        <Thead bg="primary">
          <Tr>
            {[
              "firstName",
              "lastName",
              "email",
              "mobileNumber",
              "studentCount",
              "assignedCount",
              "assignedThisMonth",
              "studentsCreatedThisMonth",
              "totalIncome",
              "incomeThisMonth",
              "base_salary", // Added Base Salary
              "monthly_salary", // Added Monthly Salary
              "actions",
            ].map((field, idx) => {
              let labelText;
              if (field === "actions") {
                labelText =
                  currentLanguage === "fr"
                    ? "Actions"
                    : currentLanguage === "ar"
                    ? "الإجراءات"
                    : "Actions";
              } else if (field === "base_salary") {
                labelText =
                  currentLanguage === "fr"
                    ? "Salaire de Base"
                    : currentLanguage === "ar"
                    ? "الراتب الأساسي"
                    : "Base Salary";
              } else if (field === "monthly_salary") {
                labelText =
                  currentLanguage === "fr"
                    ? "Salaire Mensuel"
                    : currentLanguage === "ar"
                    ? "الراتب الشهري"
                    : "Monthly Salary";
              } else if (field === "firstName") {
                labelText =
                  currentLanguage === "fr"
                    ? "Prénom"
                    : currentLanguage === "ar"
                    ? "الاسم الأول"
                    : "First Name";
              } else if (field === "lastName") {
                labelText =
                  currentLanguage === "fr"
                    ? "Nom de famille"
                    : currentLanguage === "ar"
                    ? "اسم العائلة"
                    : "Last Name";
              } else if (field === "email") {
                labelText =
                  currentLanguage === "fr"
                    ? "Email"
                    : currentLanguage === "ar"
                    ? "البريد الإلكتروني"
                    : "Email";
              } else if (field === "mobileNumber") {
                labelText =
                  currentLanguage === "fr"
                    ? "Mobile"
                    : currentLanguage === "ar"
                    ? "الجوال"
                    : "Mobile";
              } else if (field === "studentCount") {
                labelText =
                  currentLanguage === "fr"
                    ? "Étudiants"
                    : currentLanguage === "ar"
                    ? "الطلاب"
                    : "Students";
              } else if (field === "assignedCount") {
                labelText =
                  currentLanguage === "fr"
                    ? "Étudiants assignés"
                    : currentLanguage === "ar"
                    ? "الطلاب المعينون"
                    : "Assigned Students";
              } else if (field === "assignedThisMonth") {
                labelText =
                  currentLanguage === "fr"
                    ? "Assignés ce mois-ci"
                    : currentLanguage === "ar"
                    ? "المعينون هذا الشهر"
                    : "Assigned This Month";
              } else if (field === "studentsCreatedThisMonth") {
                labelText =
                  currentLanguage === "fr"
                    ? "Étudiants ce mois-ci"
                    : currentLanguage === "ar"
                    ? "طلاب هذا الشهر"
                    : "Students This Month";
              } else if (field === "totalIncome") {
                labelText =
                  currentLanguage === "fr"
                    ? "Revenu total"
                    : currentLanguage === "ar"
                    ? "إجمالي الدخل"
                    : "Total Income";
              } else if (field === "incomeThisMonth") {
                labelText =
                  currentLanguage === "fr"
                    ? "Revenu ce mois-ci"
                    : currentLanguage === "ar"
                    ? "الدخل هذا الشهر"
                    : "Income This Month";
              } else {
                labelText = field; // Fallback
              }
              return (
                <Th
                  key={field}
                  isNumeric={idx >= 4}
                  onClick={() => handleSort(field)}
                  cursor="pointer"
                  color="white"
                  _hover={{ bg: "primary" }}
                >
                  {labelText}{" "}
                  {sortField === field &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon />
                    ) : (
                      <ChevronDownIcon />
                    ))}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {coordinators.map((coord) => (
            <Tr key={coord._id} _hover={{ bg: "primary", color: "white" }}>
              <Td>{coord.firstName}</Td>
              <Td>{coord.lastName}</Td>
              <Td>{coord.email}</Td>
              <Td>{coord.mobileNumber}</Td>
              <Td isNumeric>{coord.studentCount}</Td>
              <Td isNumeric>{coord.assignedCount}</Td>
              <Td isNumeric>{coord.assignedThisMonth}</Td>
              <Td isNumeric>{coord.studentsCreatedThisMonth}</Td>
              <Td isNumeric>{coord.totalIncome}</Td>
              <Td isNumeric>{coord.incomeThisMonth}</Td>
              <Td isNumeric>{coord.base_salary !== null && coord.base_salary !== undefined ? coord.base_salary : "-"}</Td>
              <Td isNumeric>{coord.monthly_salary !== null && coord.monthly_salary !== undefined ? coord.monthly_salary.toFixed(2) : "-"}</Td>
              <Td>
                <HStack spacing={2} justifyContent="center" wrap="wrap">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    mr={2}
                    onClick={() => openEditModal(coord)}
                  >
                    {currentLanguage === "fr" ? "Modifier" : currentLanguage === "ar" ? "تعديل" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    mr={2}
                    onClick={() => openDeleteModal(coord)}
                  >
                    {currentLanguage === "fr"
                      ? "Supprimer"
                      : currentLanguage === "ar"
                      ? "حذف"
                      : "Delete"}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={coord.isApproved ? "yellow" : "green"}
                    onClick={() =>
                      openApproveModal(coord, coord.isApproved)
                    }
                  >
                    {coord.isApproved
                      ? currentLanguage === "fr"
                        ? "Désapprouver"
                        : currentLanguage === "ar"
                        ? "عدم الموافقة"
                        : "Disapprove"
                      : currentLanguage === "fr"
                      ? "Approuver"
                      : currentLanguage === "ar"
                      ? "موافقة"
                      : "Approve"}
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentLanguage === "fr"
              ? "Confirmer la suppression"
              : currentLanguage === "ar"
              ? "تأكيد الحذف"
              : "Confirm Deletion"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {currentLanguage === "fr"
                ? "Êtes-vous sûr de vouloir supprimer ce coordinateur ?"
                : currentLanguage === "ar"
                ? "هل أنت متأكد أنك تريد حذف هذا المنسق؟"
                : "Are you sure you want to delete this coordinator?"}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeDeleteModal}>
              {currentLanguage === "fr"
                ? "Annuler"
                : currentLanguage === "ar"
                ? "إلغاء"
                : "Cancel"}
            </Button>
            <Button colorScheme="red" onClick={handleDeleteCoordinator}>
              {currentLanguage === "fr"
                ? "Supprimer"
                : currentLanguage === "ar"
                ? "حذف"
                : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Approve/Disapprove Confirmation Modal */}
      <Modal isOpen={isApproveModalOpen} onClose={closeApproveModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isDisapproving
              ? currentLanguage === "fr"
                ? "Confirmer la désapprobation"
                : currentLanguage === "ar"
                ? "تأكيد عدم الموافقة"
                : "Confirm Disapproval"
              : currentLanguage === "fr"
              ? "Confirmer l'approbation"
              : currentLanguage === "ar"
              ? "تأكيد الموافقة"
              : "Confirm Approval"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {isDisapproving
                ? currentLanguage === "fr"
                  ? "Êtes-vous sûr de vouloir désapprouver ce coordinateur ?"
                  : currentLanguage === "ar"
                  ? "هل أنت متأكد أنك تريد عدم الموافقة على هذا المنسق؟"
                  : "Are you sure you want to disapprove this coordinator?"
                : currentLanguage === "fr"
                ? "Êtes-vous sûr de vouloir approuver ce coordinateur ?"
                : currentLanguage === "ar"
                ? "هل أنت متأكد أنك تريد الموافقة على هذا المنسق؟"
                : "Are you sure you want to approve this coordinator?"}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeApproveModal}>
              {currentLanguage === "fr"
                ? "Annuler"
                : currentLanguage === "ar"
                ? "إلغاء"
                : "Cancel"}
            </Button>
            <Button
              colorScheme={isDisapproving ? "yellow" : "green"}
              onClick={handleToggleApproveCoordinator}
            >
              {isDisapproving
                ? currentLanguage === "fr"
                  ? "Désapprouver"
                  : currentLanguage === "ar"
                  ? "عدم الموافقة"
                  : "Disapprove"
                : currentLanguage === "fr"
                ? "Approuver"
                : currentLanguage === "ar"
                ? "موافقة"
                : "Approve"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Coordinator Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentLanguage === "fr"
              ? "Créer un coordinateur"
              : currentLanguage === "ar"
              ? "إنشاء منسق"
              : "Create Coordinator"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="create-coord-form" onSubmit={handleSubmitCreate(onCreateSubmit)}>
              {[
                { labelKey: "firstName", name: "firstName", required: true },
                { labelKey: "lastName", name: "lastName", required: true },
                {
                  labelKey: "mobileNumber",
                  name: "mobileNumber",
                  required: true,
                },
                { labelKey: "email", name: "email", required: true },
                { labelKey: "password", name: "password", required: true },
                { labelKey: "rib", name: "rib", required: false },
                { labelKey: "baseSalary", name: "base_salary", required: false, type: "number" }, // Added base_salary field
              ].map((field) => {
                let translatedLabel;
                let translatedPlaceholder;
                if (field.labelKey === "firstName") {
                  translatedLabel =
                    currentLanguage === "fr"
                      ? "Prénom"
                      : currentLanguage === "ar"
                      ? "الاسم الأول"
                      : "First Name";
                  translatedPlaceholder = translatedLabel;
                } else if (field.labelKey === "lastName") {
                  translatedLabel =
                    currentLanguage === "fr"
                      ? "Nom de famille"
                      : currentLanguage === "ar"
                      ? "اسم العائلة"
                      : "Last Name";
                  translatedPlaceholder = translatedLabel;
                } else if (field.labelKey === "mobileNumber") {
                  translatedLabel =
                    currentLanguage === "fr"
                      ? "Mobile"
                      : currentLanguage === "ar"
                      ? "الجوال"
                      : "Mobile";
                  translatedPlaceholder = translatedLabel;
                } else if (field.labelKey === "email") {
                  translatedLabel =
                    currentLanguage === "fr"
                      ? "Email"
                      : currentLanguage === "ar"
                      ? "البريد الإلكتروني"
                      : "Email";
                  translatedPlaceholder = translatedLabel;
                } else if (field.labelKey === "password") {
                  translatedLabel =
                    currentLanguage === "fr"
                      ? "Mot de passe"
                      : currentLanguage === "ar"
                      ? "كلمة المرور"
                      : "Password";
                  translatedPlaceholder = translatedLabel;
                } else if (field.labelKey === "rib") {
                  translatedLabel =
                    currentLanguage === "fr"
                      ? "RIB"
                      : currentLanguage === "ar"
                      ? "RIB"
                      : "RIB";
                  translatedPlaceholder = translatedLabel;
                } else if (field.labelKey === "baseSalary") {
                  translatedLabel =
                    currentLanguage === "fr" ? "Salaire de Base" :
                    currentLanguage === "ar" ? "الراتب الأساسي" :
                    "Base Salary";
                  translatedPlaceholder = translatedLabel;
                } else {
                  translatedLabel = field.labelKey; // fallback
                  translatedPlaceholder = field.labelKey;
                }

                return (
                  <FormControl
                    key={field.name}
                    mb={3}
                    isRequired={field.required}
                  >
                    <FormLabel>{translatedLabel}</FormLabel>
                    <Input
                      placeholder={translatedPlaceholder}
                      {...registerCreate(field.name, { // Use registerCreate
                        required: field.required
                          ? `${translatedLabel}${
                              currentLanguage === "fr"
                                ? " est requis"
                                : currentLanguage === "ar"
                                ? " مطلوب"
                                : " is required"
                            }`
                          : false,
                      })}
                    />
                    {errorsCreate[field.name] && ( // Use errorsCreate
                      <Text color="red.500" fontSize="sm">
                        {errorsCreate[field.name].message}
                      </Text>
                    )}
                  </FormControl>
                );
              })}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateModalClose}> {/* Use onCreateModalClose */}
              {currentLanguage === "fr"
                ? "Annuler"
                : currentLanguage === "ar"
                ? "إلغاء"
                : "Cancel"}
            </Button>
            <Button
              bg="primary"
              color="white"
              type="submit"
              form="create-coord-form"
              isLoading={isSubmittingCreate} // Use isSubmittingCreate
            >
              {currentLanguage === "fr"
                ? "Créer"
                : currentLanguage === "ar"
                ? "إنشاء"
                : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Coordinator Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentLanguage === "fr"
              ? "Modifier le coordinateur"
              : currentLanguage === "ar"
              ? "تعديل المنسق"
              : "Edit Coordinator"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="edit-coord-form" onSubmit={handleSubmitEdit(onEditSubmit)}>
              {[
                { labelKey: "firstName", name: "firstName", required: true },
                { labelKey: "lastName", name: "lastName", required: true },
                { labelKey: "mobileNumber", name: "mobileNumber", required: true },
                { labelKey: "email", name: "email", required: true },
                // { labelKey: "password", name: "password", required: false, type: "password", note: currentLanguage === "fr" ? "Laisser vide pour ne pas changer" : currentLanguage === "ar" ? "اتركه فارغًا لعدم التغيير" : "Leave blank to keep unchanged" },
                { labelKey: "rib", name: "rib", required: false },
                { labelKey: "baseSalary", name: "base_salary", required: false, type: "number" },
              ].map((field) => {
                let translatedLabel;
                let translatedPlaceholder;
                // Basic translations, can be expanded
                if (field.labelKey === "firstName") translatedLabel = currentLanguage === "fr" ? "Prénom" : currentLanguage === "ar" ? "الاسم الأول" : "First Name";
                else if (field.labelKey === "lastName") translatedLabel = currentLanguage === "fr" ? "Nom de famille" : currentLanguage === "ar" ? "اسم العائلة" : "Last Name";
                else if (field.labelKey === "mobileNumber") translatedLabel = currentLanguage === "fr" ? "Mobile" : currentLanguage === "ar" ? "الجوال" : "Mobile";
                else if (field.labelKey === "email") translatedLabel = currentLanguage === "fr" ? "Email" : currentLanguage === "ar" ? "البريد الإلكتروني" : "Email";
                // else if (field.labelKey === "password") translatedLabel = currentLanguage === "fr" ? "Mot de passe" : currentLanguage === "ar" ? "كلمة المرور" : "Password"; // Password label removed
                else if (field.labelKey === "rib") translatedLabel = currentLanguage === "fr" ? "RIB" : currentLanguage === "ar" ? "RIB" : "RIB";
                else if (field.labelKey === "baseSalary") translatedLabel = currentLanguage === "fr" ? "Salaire de Base" : currentLanguage === "ar" ? "الراتب الأساسي" : "Base Salary";
                else translatedLabel = field.labelKey;

                translatedPlaceholder = translatedLabel;
                // if (field.name === "password" && field.note) translatedPlaceholder = field.note; // Password note removed


                return (
                  <FormControl key={field.name} mb={3} isRequired={field.required}>
                    <FormLabel>{translatedLabel}</FormLabel>
                    <Input
                      type={field.type || "text"}
                      placeholder={translatedPlaceholder}
                      {...registerEdit(field.name, {
                        required: field.required ? `${translatedLabel} ${currentLanguage === "fr" ? "est requis" : currentLanguage === "ar" ? "مطلوب" : "is required"}` : false,
                        valueAsNumber: field.type === "number" ? true : false,
                      })}
                      defaultValue={selectedCoordinator ? selectedCoordinator[field.name] : ""}
                    />
                    {errorsEdit[field.name] && (
                      <Text color="red.500" fontSize="sm">
                        {errorsEdit[field.name].message}
                      </Text>
                    )}
                    {/* {field.name === "password" && field.note && (!errorsEdit[field.name]) && <Text fontSize="xs" color="gray.500">{field.note}</Text>} // Password note display removed */}
                  </FormControl>
                );
              })}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditModalClose}>
              {currentLanguage === "fr" ? "Annuler" : currentLanguage === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              bg="primary"
              color="white"
              type="submit"
              form="edit-coord-form"
              isLoading={isSubmittingEdit}
            >
              {currentLanguage === "fr" ? "Sauvegarder" : currentLanguage === "ar" ? "حفظ" : "Save Changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default withAuthorization(Coordinators, ["admin"]);
