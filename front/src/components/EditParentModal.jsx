import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  useToast,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useGetUsers } from "../hooks/useGetUsers";
import { useCoordinators } from "../hooks/useCoordinators"; // Import useCoordinators
import { useUpdateParent } from "../hooks/useParents";

const EditParentModal = ({ isOpen, onClose, parentData }) => {
  const currentLanguage = useSelector((state) => state.language.language);
  const toast = useToast();
  const { user } = useSelector((state) => ({
    user: state.user.user,
  }));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentStudentSelection, setCurrentStudentSelection] = useState("");
  const [coordinatorId, setCoordinatorId] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Fetch all users for student filtering
  const {
    data: allUsers,
    isLoading: isLoadingAllUsers,
    isError: isErrorAllUsers,
  } = useGetUsers();
  // Fetch coordinators using useCoordinators hook
  const {
    data: coordinators,
    isLoading: isLoadingCoordinators,
    isError: isErrorCoordinators,
  } = useCoordinators();

  const studentsForSelect = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((u) => {
      if (u.role !== "student") return false;
      // Student is available if:
      // 1. They have no parent assigned OR
      // 2. They are assigned to the current parent being edited
      return !u.parent || u.parent?._id === parentData?._id;
    });
  }, [allUsers, parentData]);

  const { mutate: updateParentMutate, isLoading: isUpdatingParent } =
    useUpdateParent();

  useEffect(() => {
    if (isOpen && parentData) {
      setFullName(parentData.fullName || "");
      setEmail(parentData.email || "");
      setMobileNumber(parentData.mobileNumber || "");
      // parentData.students from API will have _id, firstName, lastName, email.
      // selectedStudents state is used for tags which need _id, firstName, lastName.
      setSelectedStudents(
        parentData.students?.map((s) => ({
          _id: s._id,
          firstName: s.firstName,
          lastName: s.lastName,
        })) || []
      );
      setCoordinatorId(parentData.coordinator?._id || "");
      setCurrentStudentSelection("");
      setFormErrors({});
    } else if (!isOpen) {
      setFullName("");
      setEmail("");
      setMobileNumber("");
      setSelectedStudents([]);
      setCurrentStudentSelection("");
      setCoordinatorId("");
      setFormErrors({});
    }
  }, [isOpen, parentData]);

  const validateForm = () => {
    const errors = {};
    if (!fullName.trim())
      errors.fullName =
        currentLanguage === "fr"
          ? "Le nom complet est requis."
          : currentLanguage === "ar"
          ? "الاسم الكامل مطلوب."
          : "Full name is required.";
    if (!email.trim())
      errors.email =
        currentLanguage === "fr"
          ? "L'email est requis."
          : currentLanguage === "ar"
          ? "البريد الإلكتروني مطلوب."
          : "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email =
        currentLanguage === "fr"
          ? "Format d'email invalide."
          : currentLanguage === "ar"
          ? "صيغة بريد إلكتروني غير صالحة."
          : "Invalid email format.";
    if (!mobileNumber.trim())
      errors.mobileNumber =
        currentLanguage === "fr"
          ? "Le numéro de mobile est requis."
          : currentLanguage === "ar"
          ? "رقم الجوال مطلوب."
          : "Mobile number is required.";
    if (user.role === "admin" && !coordinatorId)
      errors.coordinatorId =
        currentLanguage === "fr"
          ? "La sélection du coordinateur est requise pour l'administrateur."
          : currentLanguage === "ar"
          ? "اختيار المنسق مطلوب للمسؤول."
          : "Coordinator selection is required for Admin.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStudent = () => {
    if (currentStudentSelection) {
      const studentToAdd = studentsForSelect.find(
        (s) => s._id === currentStudentSelection
      );
      if (
        studentToAdd &&
        !selectedStudents.find((s) => s._id === studentToAdd._id)
      ) {
        setSelectedStudents([
          ...selectedStudents,
          {
            _id: studentToAdd._id,
            firstName: studentToAdd.firstName,
            lastName: studentToAdd.lastName,
          },
        ]);
      }
      setCurrentStudentSelection("");
    }
  };

  const handleRemoveStudent = (studentIdToRemove) => {
    setSelectedStudents(
      selectedStudents.filter((s) => s._id !== studentIdToRemove)
    );
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur de Validation"
            : currentLanguage === "ar"
            ? "خطأ في التحقق"
            : "Validation Error",
        description:
          currentLanguage === "fr"
            ? "Veuillez remplir correctement tous les champs obligatoires."
            : currentLanguage === "ar"
            ? "يرجى ملء جميع الحقول المطلوبة بشكل صحيح."
            : "Please fill in all required fields correctly.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      fullName,
      email,
      mobileNumber,
      students: selectedStudents.map((s) => s._id), // API expects 'students' (array of IDs)
      ...(user.role === "admin" && { coordinator: coordinatorId }), // API expects 'coordinator'
    };

    updateParentMutate(
      { parentId: parentData._id, updateData: payload },
      {
        onSuccess: () => {
          toast({
            title:
              currentLanguage === "fr"
                ? "Parent Mis à Jour"
                : currentLanguage === "ar"
                ? "تم تحديث ولي الأمر"
                : "Parent Updated",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose();
        },
        onError: (error) => {
          toast({
            title:
              currentLanguage === "fr"
                ? "Erreur de Mise à Jour du Parent"
                : currentLanguage === "ar"
                ? "خطأ في تحديث ولي الأمر"
                : "Error Updating Parent",
            description:
              error?.response?.data?.message ||
              error.message ||
              (currentLanguage === "fr"
                ? "Une erreur s'est produite lors de la mise à jour du parent."
                : currentLanguage === "ar"
                ? "حدث خطأ أثناء تحديث ولي الأمر."
                : "An error occurred while updating the parent."),
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {currentLanguage === "fr"
            ? "Modifier le Parent"
            : currentLanguage === "ar"
            ? "تعديل ولي الأمر"
            : "Edit Parent"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={formErrors.fullName}>
              <FormLabel htmlFor="edit-fullName">
                {currentLanguage === "fr"
                  ? "Nom Complet"
                  : currentLanguage === "ar"
                  ? "الاسم الكامل"
                  : "Full Name"}
              </FormLabel>
              <Input
                id="edit-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  currentLanguage === "fr"
                    ? "Entrez le nom complet"
                    : currentLanguage === "ar"
                    ? "أدخل الاسم الكامل"
                    : "Enter full name"
                }
              />
              {formErrors.fullName && (
                <Text color="red.500" fontSize="sm">
                  {formErrors.fullName}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.email}>
              <FormLabel htmlFor="edit-email">
                {currentLanguage === "fr"
                  ? "Email"
                  : currentLanguage === "ar"
                  ? "البريد الإلكتروني"
                  : "Email"}
              </FormLabel>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  currentLanguage === "fr"
                    ? "Entrez l'e-mail"
                    : currentLanguage === "ar"
                    ? "أدخل البريد الإلكتروني"
                    : "Enter email"
                }
              />
              {formErrors.email && (
                <Text color="red.500" fontSize="sm">
                  {formErrors.email}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.mobileNumber}>
              <FormLabel htmlFor="edit-mobileNumber">
                {currentLanguage === "fr"
                  ? "Numéro de Mobile"
                  : currentLanguage === "ar"
                  ? "رقم الجوال"
                  : "Mobile Number"}
              </FormLabel>
              <Input
                id="edit-mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder={
                  currentLanguage === "fr"
                    ? "Entrez le numéro de mobile"
                    : currentLanguage === "ar"
                    ? "أدخل رقم الجوال"
                    : "Enter mobile number"
                }
              />
              {formErrors.mobileNumber && (
                <Text color="red.500" fontSize="sm">
                  {formErrors.mobileNumber}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="edit-students">
                {currentLanguage === "fr"
                  ? "Sélectionner Étudiants"
                  : currentLanguage === "ar"
                  ? "اختر الطلاب"
                  : "Select Students"}
              </FormLabel>
              <HStack>
                <Select
                  id="edit-students"
                  placeholder={
                    currentLanguage === "fr"
                      ? "Sélectionnez un étudiant..."
                      : currentLanguage === "ar"
                      ? "اختر طالبًا..."
                      : "Select a student..."
                  }
                  value={currentStudentSelection}
                  onChange={(e) => setCurrentStudentSelection(e.target.value)}
                  isDisabled={isLoadingAllUsers}
                >
                  {isLoadingAllUsers ? (
                    <option>
                      {currentLanguage === "fr"
                        ? "Chargement des étudiants..."
                        : currentLanguage === "ar"
                        ? "جارٍ تحميل الطلاب..."
                        : "Loading students..."}
                    </option>
                  ) : (
                    studentsForSelect
                      .filter(
                        (s) =>
                          !selectedStudents.find((selS) => selS._id === s._id)
                      )
                      .map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.firstName} {student.lastName} (
                          {student.email})
                        </option>
                      ))
                  )}
                </Select>
                <Button
                  onClick={handleAddStudent}
                  isDisabled={!currentStudentSelection}
                >
                  {currentLanguage === "fr"
                    ? "Ajouter Étudiant"
                    : currentLanguage === "ar"
                    ? "إضافة طالب"
                    : "Add Student"}
                </Button>
              </HStack>
              <Box mt={2} display="flex" flexWrap="wrap">
                {selectedStudents.map((student) => (
                  <Tag
                    size="md"
                    key={student._id}
                    borderRadius="full"
                    variant="solid"
                    colorScheme="teal"
                    m={1}
                  >
                    <TagLabel>
                      {student.firstName} {student.lastName}
                    </TagLabel>
                    <TagCloseButton
                      onClick={() => handleRemoveStudent(student._id)}
                    />
                  </Tag>
                ))}
              </Box>
            </FormControl>

            {user.role === "admin" && (
              <FormControl isInvalid={formErrors.coordinatorId}>
                <FormLabel htmlFor="edit-coordinator">
                  {currentLanguage === "fr"
                    ? "Sélectionner Coordinateur"
                    : currentLanguage === "ar"
                    ? "اختر المنسق"
                    : "Select Coordinator"}
                </FormLabel>
                {isLoadingCoordinators ? (
                  <Spinner />
                ) : (
                  <Select
                    id="edit-coordinator"
                    placeholder={
                      currentLanguage === "fr"
                        ? "Sélectionnez un coordinateur..."
                        : currentLanguage === "ar"
                        ? "اختر منسقًا..."
                        : "Select a coordinator..."
                    }
                    value={coordinatorId}
                    onChange={(e) => setCoordinatorId(e.target.value)}
                  >
                    {coordinators?.map((coord) => (
                      <option key={coord._id} value={coord._id}>
                        {coord.firstName} {coord.lastName} ({coord.email})
                      </option>
                    ))}
                  </Select>
                )}
                {formErrors.coordinatorId && (
                  <Text color="red.500" fontSize="sm">
                    {formErrors.coordinatorId}
                  </Text>
                )}
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            {currentLanguage === "fr"
              ? "Annuler"
              : currentLanguage === "ar"
              ? "إلغاء"
              : "Cancel"}
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isUpdatingParent}
          >
            {currentLanguage === "fr"
              ? "Mettre à jour"
              : currentLanguage === "ar"
              ? "تحديث"
              : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditParentModal;
