import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  CheckboxGroup,
  Stack,
  Checkbox,
  Text,
  Box,
  Input,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import apiClient from "../hooks/apiClient";
import { t } from "../utils/translations";

const AddStudentToGroupModal = ({ isOpen, onClose, group, fetchGroups }) => {
  const language = useSelector((state) => state.language.language);
  const toast = useToast();

  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!isOpen || !group) return;
      setIsLoading(true);
      try {
        // Fetch all students (or students not in any group, or students of a certain coordinator if applicable)
        // This endpoint might need to be adjusted based on how students are managed/filtered
        const response = await apiClient.get("/users/students"); // Assuming endpoint for all students

        // Filter out students already in the current group
        const groupStudentIds = group.students.map(s => s._id);
        const filtered = response.data.users.filter(
          (student) => !groupStudentIds.includes(student._id) && student.isApproved // Only approved students
        );
        setAvailableStudents(filtered);
        setFormError(null);
      } catch (err) {
        console.error("Error fetching students:", err);
        setFormError(
          t("errorFetchingModalData", language, "en", {
            error: "Failed to load students.",
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
    setSelectedStudents([]); // Reset selected students when modal opens or group changes
    setSearchTerm(""); // Reset search term
  }, [isOpen, group, language]);

  const handleStudentSelectionChange = (selectedValues) => {
    setSelectedStudents(selectedValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      setFormError(t("selectStudents", language)); // Or a more specific message
      return;
    }

    const currentStudentCount = group.students?.length || 0;
    const planLimit = group.plan?.numberOfStudents;

    if (currentStudentCount + selectedStudents.length > planLimit) {
      setFormError(
        t("groupIsFull", language) + // Using existing translation key and then adding specifics
        ` ${language === "en" ? "Adding" : "Ajouter"} ${selectedStudents.length} ${language === "en" ? "students would exceed the limit of" : "étudiants dépasserait la limite de"} ${planLimit}. ${language === "en" ? "Current count:" : "Nombre actuel:"} ${currentStudentCount}.`
      );
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      // Sequentially add students to better handle individual errors if needed,
      // or backend can be modified to accept an array of students
      for (const studentId of selectedStudents) {
        await apiClient.put(`/groups/${group._id}/students/add`, { studentId });
      }

      toast({
        title: t("studentAddedSuccess", language),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchGroups();
      onClose();
    } catch (err) {
      console.error("Error adding student(s) to group:", err);
      const errorMessage = err.response?.data?.message || t("errorAddingStudent", language, "en", { error: "Operation failed" });
      setFormError(errorMessage);
      toast({
        title: t("global.toast.errorTitle", language),
        description: errorMessage,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvailableStudents = availableStudents.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t("addStudentToGroup", language)}: {group?.name}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            {formError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {formError}
              </Alert>
            )}

            <Text mb={2}>
                {t("plan", language)}: {group?.plan?.name} ({t("maxStudents", language, "en", {count: group?.plan?.numberOfStudents})})
            </Text>
            <Text mb={4}>
                {language === "en" ? "Current students" : "Étudiants actuels"}: {group?.students?.length || 0}
            </Text>

            {isLoading && !availableStudents.length ? (
              <Spinner />
            ) : (
              <>
                <Input
                    placeholder={language === "en" ? "Search students by name or email..." : "Rechercher des étudiants par nom ou email..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    mb={4}
                />
                {filteredAvailableStudents.length > 0 ? (
                <CheckboxGroup
                    colorScheme="teal"
                    value={selectedStudents}
                    onChange={handleStudentSelectionChange}
                >
                    <Stack spacing={2} maxHeight="300px" overflowY="auto" borderWidth="1px" borderRadius="md" p={3}>
                    {filteredAvailableStudents.map((student) => (
                        <Checkbox key={student._id} value={student._id}>
                        {student.firstName} {student.lastName} ({student.email})
                        </Checkbox>
                    ))}
                    </Stack>
                </CheckboxGroup>
                ) : (
                    <Text>{language === "en" ? "No available students found matching your search or all students are already in a group/not approved." : "Aucun étudiant disponible trouvé correspondant à votre recherche ou tous les étudiants sont déjà dans un groupe/non approuvés."}</Text>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3} variant="ghost">
              {t("cancel", language)}
            </Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={isLoading}
              isDisabled={selectedStudents.length === 0}
            >
              {t("addStudent", language)}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddStudentToGroupModal;
