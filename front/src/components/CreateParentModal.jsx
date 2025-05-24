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
import { useCreateParent } from "../hooks/useParents";
import { t } from "../utils/translations";

const CreateParentModal = ({ isOpen, onClose, language }) => {
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
    return allUsers?.filter((u) => u.role === "student") || [];
  }, [allUsers]);

  const { mutate: createParentMutate, isLoading: isCreatingParent } =
    useCreateParent();

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setEmail("");
      setMobileNumber("");
      setSelectedStudents([]);
      setCurrentStudentSelection("");
      setCoordinatorId("");
      setFormErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = t("fullNameRequired", language);
    if (!email.trim()) errors.email = t("emailRequired", language);
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = t("invalidEmailFormat", language);
    if (!mobileNumber.trim())
      errors.mobileNumber = t("mobileNumberRequired", language);
    if (user.role === "admin" && !coordinatorId)
      errors.coordinatorId = t("coordinatorRequiredForAdmin", language);
    // selectedStudents can be empty if desired
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
        setSelectedStudents([...selectedStudents, studentToAdd]);
      }
      setCurrentStudentSelection("");
    }
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter((s) => s._id !== studentId));
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: t("validationErrorTitle", language),
        description: t("fillRequiredFields", language),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const parentPayload = {
      // Corrected variable name from previous diff
      fullName,
      email,
      mobileNumber,
      students: selectedStudents.map((s) => s._id), // API expects 'students'
      ...(user.role === "admin" && { coordinator: coordinatorId }), // API expects 'coordinator'
    };

    createParentMutate(parentPayload, {
      onSuccess: () => {
        toast({
          title: t("parentCreatedSuccessTitle", language),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: t("errorCreatingParentTitle", language),
          description:
            error?.response?.data?.message ||
            error.message ||
            t("errorCreatingParentDesc", language),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("createParent", language)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isInvalid={formErrors.fullName}>
              <FormLabel htmlFor="fullName">
                {t("fullName", language)}
              </FormLabel>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("enterFullName", language)}
              />
              {formErrors.fullName && (
                <Text color="red.500" fontSize="sm">
                  {formErrors.fullName}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.email}>
              <FormLabel htmlFor="email">{t("email", language)}</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("enterEmail", language)}
              />
              {formErrors.email && (
                <Text color="red.500" fontSize="sm">
                  {formErrors.email}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={formErrors.mobileNumber}>
              <FormLabel htmlFor="mobileNumber">
                {t("mobileNumber", language)}
              </FormLabel>
              <Input
                id="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder={t("enterMobileNumber", language)}
              />
              {formErrors.mobileNumber && (
                <Text color="red.500" fontSize="sm">
                  {formErrors.mobileNumber}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="students">
                {t("selectStudents", language)}
              </FormLabel>
              <HStack>
                <Select
                  id="students"
                  placeholder={t("selectStudentPlaceholder", language)}
                  value={currentStudentSelection}
                  onChange={(e) => setCurrentStudentSelection(e.target.value)}
                  isDisabled={isLoadingAllUsers}
                >
                  {isLoadingAllUsers ? (
                    <option>{t("loadingStudents", language)}</option>
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
                  {t("addStudent", language)}
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
                <FormLabel htmlFor="coordinator">
                  {t("selectCoordinator", language)}
                </FormLabel>
                {isLoadingCoordinators ? (
                  <Spinner />
                ) : (
                  <Select
                    id="coordinator"
                    placeholder={t("selectCoordinatorPlaceholder", language)}
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
            {t("cancel", language)}
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isCreatingParent}
          >
            {t("create", language)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateParentModal;
