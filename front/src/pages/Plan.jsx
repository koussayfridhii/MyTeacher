import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Badge,
  HStack,
  Button,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import axios from "axios";
import { withAuthorization } from "../HOC/Protect";

const Plan = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const user = useSelector((state) => state.user?.user);

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    color: "#000000",
    numberOfStudents: "",
  });

  const token = localStorage.getItem("token");

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPlans(res.data.plans);
    } catch (err) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la récupération des plans"
            : currentLanguage === "ar"
            ? "فشل في جلب الخطط"
            : "Failed to fetch plans",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title:
          currentLanguage === "fr"
            ? "Plan supprimé"
            : currentLanguage === "ar"
            ? "تم حذف الخطة"
            : "Plan deleted",
        status: "success",
      });
      fetchPlans();
    } catch {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la suppression"
            : currentLanguage === "ar"
            ? "فشل الحذف"
            : "Delete failed",
        status: "error",
      });
    }
  };

  const handleUpdateClick = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      cost: plan.cost,
      color: plan.color,
      numberOfStudents: plan.numberOfStudents,
    });
    onEditOpen();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async () => {
    const { name, cost, color, numberOfStudents } = formData;
    if (!name || !cost || !color || !numberOfStudents) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Tous les champs sont obligatoires"
            : currentLanguage === "ar"
            ? "جميع الحقول مطلوبة"
            : "All fields are required",
        status: "warning",
      });
      return;
    }
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/plans/${selectedPlan._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title:
          currentLanguage === "fr"
            ? "Plan mis à jour"
            : currentLanguage === "ar"
            ? "تم تحديث الخطة"
            : "Plan updated",
        status: "success",
      });
      onEditClose();
      fetchPlans();
    } catch {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la mise à jour"
            : currentLanguage === "ar"
            ? "فشل التحديث"
            : "Update failed",
        status: "error",
      });
    }
  };

  const handleSubmitCreate = async () => {
    const { name, cost, color, numberOfStudents } = formData;
    if (!name || !cost || !color || !numberOfStudents) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Tous les champs sont obligatoires"
            : currentLanguage === "ar"
            ? "جميع الحقول مطلوبة"
            : "All fields are required",
        status: "warning",
      });
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/plans`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title:
          currentLanguage === "fr"
            ? "Plan créé"
            : currentLanguage === "ar"
            ? "تم إنشاء الخطة"
            : "Plan created",
        status: "success",
      });
      onCreateClose();
      fetchPlans();
    } catch {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la création"
            : currentLanguage === "ar"
            ? "فشل الإنشاء"
            : "Creation failed",
        status: "error",
      });
    }
  };

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          {currentLanguage === "fr"
            ? "Plans"
            : currentLanguage === "ar"
            ? "الخطط"
            : "Plans"}
        </Text>
        {user.role === "admin" && (
          <Button
            colorScheme="green"
            onClick={() => {
              setFormData({
                name: "",
                cost: "",
                color: "#000000",
                numberOfStudents: "",
              });
              onCreateOpen();
            }}
          >
            {currentLanguage === "fr"
              ? "+ Créer un nouveau plan"
              : currentLanguage === "ar"
              ? "+ إنشاء خطة جديدة"
              : "+ Create New Plan"}
          </Button>
        )}
      </HStack>

      {loading ? (
        <Spinner size="lg" />
      ) : (
        <TableContainer border="1px solid #ccc" borderRadius="md">
          <Table variant="striped">
            <Thead bg="gray.100">
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
                    ? "Coût"
                    : currentLanguage === "ar"
                    ? "التكلفة"
                    : "Cost"}
                </Th>
                <Th>
                  {currentLanguage === "fr"
                    ? "Étudiants"
                    : currentLanguage === "ar"
                    ? "الطلاب"
                    : "Students"}
                </Th>
                <Th>
                  {currentLanguage === "fr"
                    ? "Couleur"
                    : currentLanguage === "ar"
                    ? "اللون"
                    : "Color"}
                </Th>
                <Th>
                  {currentLanguage === "fr"
                    ? "Créé le"
                    : currentLanguage === "ar"
                    ? "أنشئت في"
                    : "Created At"}
                </Th>
                {user?.role === "admin" && (
                  <Th>
                    {currentLanguage === "fr"
                      ? "Actions"
                      : currentLanguage === "ar"
                      ? "الإجراءات"
                      : "Actions"}
                  </Th>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {plans.map((plan) => (
                <Tr key={plan._id}>
                  <Td>{plan.name}</Td>
                  <Td>${plan.cost}</Td>
                  <Td>{plan.numberOfStudents}</Td>
                  <Td>
                    <Badge bgColor={plan.color} color="white">
                      {plan.color}
                    </Badge>
                  </Td>
                  <Td>
                    {new Date(plan.createdAt).toLocaleDateString("en-GB")}
                  </Td>
                  {user?.role === "admin" && (
                    <Td>
                      <HStack>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleUpdateClick(plan)}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(plan._id)}
                        />
                      </HStack>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentLanguage === "fr"
              ? "Modifier le plan"
              : currentLanguage === "ar"
              ? "تعديل الخطة"
              : "Edit Plan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Nom"
                  : currentLanguage === "ar"
                  ? "الاسم"
                  : "Name"}
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Coût"
                  : currentLanguage === "ar"
                  ? "التكلفة"
                  : "Cost"}
              </FormLabel>
              <NumberInput>
                <NumberInputField
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Nombre d'étudiants"
                  : currentLanguage === "ar"
                  ? "عدد الطلاب"
                  : "Number of Students"}
              </FormLabel>
              <NumberInput>
                <NumberInputField
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Couleur"
                  : currentLanguage === "ar"
                  ? "اللون"
                  : "Color"}
              </FormLabel>
              <Input
                name="color"
                type="color"
                value={formData.color}
                onChange={handleFormChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onEditClose} mr={3}>
              {currentLanguage === "fr"
                ? "Annuler"
                : currentLanguage === "ar"
                ? "إلغاء"
                : "Cancel"}
            </Button>
            <Button colorScheme="blue" onClick={handleSubmitEdit}>
              {currentLanguage === "fr"
                ? "Enregistrer"
                : currentLanguage === "ar"
                ? "حفظ"
                : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentLanguage === "fr"
              ? "Créer un nouveau plan"
              : currentLanguage === "ar"
              ? "إنشاء خطة جديدة"
              : "Create New Plan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Nom"
                  : currentLanguage === "ar"
                  ? "الاسم"
                  : "Name"}
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Coût"
                  : currentLanguage === "ar"
                  ? "التكلفة"
                  : "Cost"}
              </FormLabel>
              <NumberInput>
                <NumberInputField
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Nombre d'étudiants"
                  : currentLanguage === "ar"
                  ? "عدد الطلاب"
                  : "Number of Students"}
              </FormLabel>
              <NumberInput>
                <NumberInputField
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>
                {currentLanguage === "fr"
                  ? "Couleur"
                  : currentLanguage === "ar"
                  ? "اللون"
                  : "Color"}
              </FormLabel>
              <Input
                name="color"
                type="color"
                value={formData.color}
                onChange={handleFormChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCreateClose} mr={3}>
              {currentLanguage === "fr"
                ? "Annuler"
                : currentLanguage === "ar"
                ? "إلغاء"
                : "Cancel"}
            </Button>
            <Button colorScheme="green" onClick={handleSubmitCreate}>
              {currentLanguage === "fr"
                ? "Créer"
                : currentLanguage === "ar"
                ? "إنشاء"
                : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default withAuthorization(Plan, ["admin", "coordinator"]);
