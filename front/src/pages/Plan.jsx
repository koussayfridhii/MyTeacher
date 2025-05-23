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
      toast({ title: "Failed to fetch plans", status: "error" });
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
      toast({ title: "Plan deleted", status: "success" });
      fetchPlans();
    } catch {
      toast({ title: "Delete failed", status: "error" });
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
      toast({ title: "All fields are required", status: "warning" });
      return;
    }
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/plans/${selectedPlan._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Plan updated", status: "success" });
      onEditClose();
      fetchPlans();
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleSubmitCreate = async () => {
    const { name, cost, color, numberOfStudents } = formData;
    if (!name || !cost || !color || !numberOfStudents) {
      toast({ title: "All fields are required", status: "warning" });
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/plans`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Plan created", status: "success" });
      onCreateClose();
      fetchPlans();
    } catch {
      toast({ title: "Creation failed", status: "error" });
    }
  };

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Plans
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
            + Create New Plan
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
                <Th>Name</Th>
                <Th>Cost</Th>
                <Th>Students</Th>
                <Th>Color</Th>
                <Th>Created At</Th>
                {user?.role === "admin" && <Th>Actions</Th>}
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
          <ModalHeader>Edit Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Cost</FormLabel>
              <NumberInput>
                <NumberInputField
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Number of Students</FormLabel>
              <NumberInput>
                <NumberInputField
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Color</FormLabel>
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
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmitEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={3}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Cost</FormLabel>
              <NumberInput>
                <NumberInputField
                  name="cost"
                  value={formData.cost}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Number of Students</FormLabel>
              <NumberInput>
                <NumberInputField
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleFormChange}
                />
              </NumberInput>
            </FormControl>
            <FormControl isRequired mb={3}>
              <FormLabel>Color</FormLabel>
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
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmitCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default withAuthorization(Plan, ["admin", "coordinator"]);
