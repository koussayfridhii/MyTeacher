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
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useCoordinators } from "../hooks/useCoordinators";
import { withAuthorization } from "../HOC/Protect";
import { useForm } from "react-hook-form";
import axios from "axios";

const Coordinators = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const onSubmit = async (data) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/create`, {
        ...data,
        role: "coordinator",
      });
      reset();
      onClose();
      refetch();
    } catch (err) {
      console.error(err);
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
          Failed to load coordinators.
        </Text>
      </Center>
    );

  return (
    <Box p={4} borderWidth="1px" borderColor="primary" borderRadius="md">
      <Button mb={4} bg="primary" color="white" onClick={onOpen}>
        Create Coordinator
      </Button>
      <Input
        placeholder="Search coordinators"
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
            ].map((field, idx) => {
              const labels = {
                firstName: "First Name",
                lastName: "Last Name",
                email: "Email",
                mobileNumber: "Mobile",
                studentCount: "Students",
                assignedCount: "Assigned Students",
                assignedThisMonth: "Assigned This Month",
                studentsCreatedThisMonth: "Students This Month",
                totalIncome: "Total Income",
                incomeThisMonth: "Income This Month",
              };
              return (
                <Th
                  key={field}
                  isNumeric={idx >= 4}
                  onClick={() => handleSort(field)}
                  cursor="pointer"
                  color="white"
                  _hover={{ bg: "primary" }}
                >
                  {labels[field]}{" "}
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
            <Tr key={coord._id} _hover={{ bg: "primary" }}>
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
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Coordinator</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="create-coord-form" onSubmit={handleSubmit(onSubmit)}>
              {[
                { label: "First Name", name: "firstName", required: true },
                { label: "Last Name", name: "lastName", required: true },
                { label: "Mobile", name: "mobileNumber", required: true },
                { label: "Email", name: "email", required: true },
                { label: "Password", name: "password", required: true },
                { label: "RIB", name: "rib", required: false },
              ].map((field) => (
                <FormControl
                  key={field.name}
                  mb={3}
                  isRequired={field.required}
                >
                  <FormLabel>{field.label}</FormLabel>
                  <Input
                    placeholder={field.label}
                    {...register(field.name, { required: field.required })}
                  />
                  {errors[field.name] && (
                    <Text color="red.500" fontSize="sm">
                      {field.label} is required
                    </Text>
                  )}
                </FormControl>
              ))}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg="primary"
              color="white"
              type="submit"
              form="create-coord-form"
              isLoading={isSubmitting}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default withAuthorization(Coordinators, ["admin"]);
