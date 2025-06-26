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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import apiClient from "../hooks/apiClient";
import { t } from "../utils/translations";

const CreateGroupModal = ({ isOpen, onClose, fetchGroups, editingGroup, currentUser }) => {
  const language = useSelector((state) => state.language.language);
  const toast = useToast();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [level, setLevel] = useState("");
  const [planId, setPlanId] = useState("");
  const [comments, setComments] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchTeachersAndPlans = async () => {
      setIsLoading(true);
      try {
        // Fetch all users and filter for approved teachers
        const usersRes = await apiClient.get("/users");
        const approvedTeachers = usersRes.data.users.filter(
          (user) => user.role === "teacher" && user.isApproved
        );
        setTeachers(approvedTeachers);

        // Fetch plans
        const plansRes = await apiClient.get("/plans");
        if (plansRes.data && Array.isArray(plansRes.data)) {
          setPlans(plansRes.data);
        } else if (plansRes.data && Array.isArray(plansRes.data.plans)) { // if plans are nested under a 'plans' key
          setPlans(plansRes.data.plans);
        }
        else {
          console.error("Plans data is not in expected format:", plansRes.data);
          setPlans([]); // Set to empty array if format is incorrect
        }

        setFormError(null);
      } catch (err) {
        console.error("Error fetching teachers or plans:", err.response ? err.response.data : err.message);
        setFormError(
          t("errorFetchingModalData", language, "en", {
            error: "Failed to load data for form.",
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTeachersAndPlans();
      if (editingGroup) {
        setName(editingGroup.name || "");
        setSubject(editingGroup.subject || "");
        setTeacherId(editingGroup.teacher?._id || "");
        setLevel(editingGroup.level || "");
        setPlanId(editingGroup.plan?._id || "");
        setComments(editingGroup.comments || "");
      } else {
        // Reset form for new group
        setName("");
        setSubject("");
        setTeacherId("");
        setLevel("");
        setPlanId("");
        setComments("");
      }
    }
  }, [isOpen, editingGroup, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const groupData = {
      name,
      subject,
      teacher: teacherId,
      level,
      plan: planId,
      comments,
      // students array is not managed here, but on creation, it can be empty or passed if needed in future
    };

    if (!name || !subject || !teacherId || !level || !planId) {
        setFormError(t("fillRequiredFields", language));
        setIsLoading(false);
        return;
    }

    try {
      if (editingGroup) {
        await apiClient.put(`/groups/${editingGroup._id}`, groupData);
        toast({
          title: t("groupUpdatedSuccessTitle", language, "en", { default: "Group Updated" }),
          description: t("groupUpdatedSuccessDesc", language, "en", { default: "Group has been successfully updated." }),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // groupData.createdBy = currentUser._id; // Backend should get this from req.user
        await apiClient.post("/groups", groupData);
        toast({
          title: t("groupCreatedSuccessTitle", language, "en", { default: "Group Created" }),
          description: t("groupCreatedSuccessDesc", language, "en", { default: "Group has been successfully created." }),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      fetchGroups(); // Refresh the list of groups
      onClose(); // Close modal
    } catch (err) {
      console.error("Error saving group:", err);
      const errorMessage = err.response?.data?.message || (editingGroup ? t("errorUpdatingGroup", language) : t("errorCreatingGroup", language));
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editingGroup
            ? (language === "en" ? "Edit Group" : "Modifier le Groupe")
            : (language === "en" ? "Create New Group" : "Créer un Nouveau Groupe")}
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
            <FormControl isRequired mt={4}>
              <FormLabel>{language === "en" ? "Group Name" : "Nom du Groupe"}</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === "en" ? "Enter group name" : "Entrez le nom du groupe"}
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>{language === "en" ? "Subject" : "Matière"}</FormLabel>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={language === "en" ? "e.g., Mathematics, English" : "ex: Mathématiques, Anglais"}
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>{language === "en" ? "Teacher" : "Professeur"}</FormLabel>
              {isLoading && !teachers.length ? <Spinner/> : (
                <Select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    placeholder={language === "en" ? "Select a teacher" : "Sélectionnez un professeur"}
                >
                    {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                    </option>
                    ))}
                </Select>
              )}
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>{language === "en" ? "Level" : "Niveau"}</FormLabel>
              <Input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder={language === "en" ? "e.g., Beginner, Intermediate, A1" : "ex: Débutant, Intermédiaire, A1"}
              />
            </FormControl>

            <FormControl isRequired mt={4}>
              <FormLabel>{language === "en" ? "Plan" : "Plan"}</FormLabel>
               {isLoading && !plans.length ? <Spinner/> : (
                <Select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    placeholder={language === "en" ? "Select a plan" : "Sélectionnez un plan"}
                >
                    {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                        {plan.name} ({language === "en" ? "Max" : "Max"}: {plan.numberOfStudents} {language === "en" ? "students" : "étudiants"})
                    </option>
                    ))}
                </Select>
               )}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>{language === "en" ? "Comments (Optional)" : "Commentaires (Optionnel)"}</FormLabel>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={language === "en" ? "Any additional notes" : "Notes additionnelles"}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3} variant="ghost">
              {language === "en" ? "Cancel" : "Annuler"}
            </Button>
            <Button colorScheme="teal" type="submit" isLoading={isLoading}>
              {editingGroup ? (language === "en" ? "Update Group" : "Mettre à Jour") : (language === "en" ? "Create Group" : "Créer Groupe")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateGroupModal;
