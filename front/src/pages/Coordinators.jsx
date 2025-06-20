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
import { useSelector } from "react-redux"; // Import useSelector

const Coordinators = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
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
      <Button mb={4} bg="primary" color="white" onClick={onOpen}>
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
            ].map((field, idx) => {
              let labelText;
              if (field === "firstName") {
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
          <ModalHeader>
            {currentLanguage === "fr"
              ? "Créer un coordinateur"
              : currentLanguage === "ar"
              ? "إنشاء منسق"
              : "Create Coordinator"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="create-coord-form" onSubmit={handleSubmit(onSubmit)}>
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
                      {...register(field.name, {
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
                    {errors[field.name] && (
                      <Text color="red.500" fontSize="sm">
                        {errors[field.name].message}
                      </Text>
                    )}
                  </FormControl>
                );
              })}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
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
              isLoading={isSubmitting}
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
    </Box>
  );
};

export default withAuthorization(Coordinators, ["admin"]);
