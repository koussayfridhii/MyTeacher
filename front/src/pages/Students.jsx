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
  useToast,
  useDisclosure,
  Center,
  Spinner,
  Select,
  Icon,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { withAuthorization } from "../HOC/Protect";
import CreateStudentModal from "../components/CreateUserModal";
import { useGetUsers, useApproveUser } from "../hooks/useGetUsers";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Students = () => {
  const token = localStorage.getItem("token");
  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user);
  const toast = useToast();
  const location = useLocation();
  const isMyStudentsRoute = location.pathname.includes("mystudents");
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useGetUsers();
  const approveMutation = useApproveUser();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // modal controls
  const studentModal = useDisclosure();

  // translations
  const t = {
    en: {
      title: isMyStudentsRoute ? "My Students" : "Manage Students",
      search: "Search...",
      name: "Name",
      mobile: "Mobile",
      balance: "Balance",
      minimum: "Minimum",
      approve: "Approve",
      disapprove: "Disapprove",
      status: "Status",
      prev: "Previous",
      next: "Next",
      approvedMsg: "Student approved",
      disapprovedMsg: "Student disapproved",
      errorMsg: "Action failed",
      createBtn: "Create Student",
      modalTitle: "New Student",
      submit: "Submit",
      discountPct: "Discount %",
      createDiscount: "Create Discount",
      editDiscount: "Edit Discount",
      email: "E-mail",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
    },
    fr: {
      title: isMyStudentsRoute ? "Mes étudiants" : "Gérer les étudiants",
      search: "Rechercher...",
      name: "Nom",
      mobile: "Numéro de mobile",
      balance: "Solde",
      minimum: "Minimum",
      approve: "Approuver",
      disapprove: "Désapprouver",
      status: "Statut",
      prev: "Précédent",
      next: "Suivant",
      approvedMsg: "Étudiant approuvé",
      disapprovedMsg: "Étudiant désapprouvé",
      errorMsg: "Action échouée",
      createBtn: "Créer un étudiant",
      modalTitle: "Nouvel étudiant",
      submit: "Soumettre",
      discountPct: "% Remise",
      createDiscount: "Créer une remise",
      editDiscount: "Modifier la remise",
      email: "E-mail",
      password: "Mot de passe",
      firstName: "Prénom",
      lastName: "Nom",
    },
    ar: {
      title: isMyStudentsRoute ? "طلابي" : "إدارة الطلاب",
      search: "ابحث...",
      name: "الاسم",
      mobile: "رقم الجوال",
      balance: "الرصيد",
      minimum: "الحد الأدنى",
      approve: "موافقة",
      disapprove: "رفض",
      status: "الحالة",
      prev: "السابق",
      next: "التالي",
      approvedMsg: "تمت الموافقة على الطالب",
      disapprovedMsg: "تم رفض الطالب",
      errorMsg: "فشلت العملية",
      createBtn: "إنشاء طالب",
      modalTitle: "طالب جديد",
      submit: "إرسال",
      discountPct: "% الخصم",
      createDiscount: "إنشاء خصم",
      editDiscount: "تعديل الخصم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
    },
  };
  const labels = t[language] || t.en;

  // filter for students
  const allStudents = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );

  // show all students for admin, or filter by coordinator on "My Students"
  const students = useMemo(() => {
    if (user.role === "admin") return allStudents;
    if (isMyStudentsRoute && user?._id)
      return allStudents.filter((s) => s.coordinator?._id === user._id);
    return allStudents;
  }, [allStudents, isMyStudentsRoute, user]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStudents = useMemo(() => {
    let sorted = [...students];
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aValue, bValue;

        switch (sortColumn) {
          case "name":
            aValue = `${a.firstName} ${a.lastName}`;
            bValue = `${b.firstName} ${b.lastName}`;
            break;
          case "balance":
            aValue = a.wallet?.balance ?? 0;
            bValue = b.wallet?.balance ?? 0;
            break;
          case "minimum":
            aValue = a.wallet?.minimum ?? 0;
            bValue = b.wallet?.minimum ?? 0;
            break;
          case "status":
            aValue = a.isApproved ? "Approved" : "Not Approved";
            bValue = b.isApproved ? "Approved" : "Not Approved";
            break;
          case "coordinator":
            aValue = a.coordinator ? `${a.coordinator.firstName} ${a.coordinator.lastName}` : "";
            bValue = b.coordinator ? `${b.coordinator.firstName} ${b.coordinator.lastName}` : "";
            break;
          default:
            aValue = a[sortColumn];
            bValue = b[sortColumn];
        }

        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
      });
    }
    return sorted;
  }, [students, sortColumn, sortDirection]);

  // search + pagination
  const filtered = useMemo(
    () =>
      sortedStudents.filter((stu) =>
        `${stu?.firstName} ${stu?.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [sortedStudents, search]
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filtered, page, itemsPerPage]
  );

  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <Icon as={FaSortUp} /> : <Icon as={FaSortDown} />;
    }
    return <Icon as={FaSort} color="gray.400" />;
  };
  // approve handler with optional coordinator
  const handleApprove = (id, approve, coordinatorId = null) => {
    const payload = { id, approve };
    if (coordinatorId) payload.coordinatorId = coordinatorId;
    console.log(payload);

    approveMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: approve ? labels.approvedMsg : labels.disapprovedMsg,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      },
      onError: () =>
        toast({
          title: labels.errorMsg,
          status: "error",
          duration: 3000,
          isClosable: true,
        }),
    });
  };

  // create student
  const handleCreate = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/create`,
        { ...data, role: "student" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: labels.createBtn + "d",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      studentModal.onClose();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch {
      toast({
        title: labels.errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const coordinators = users.filter((u) => u.role === "coordinator");

  if (isLoading)
    return (
      <Center w="full" h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Box p={6} bg="white" color="black" borderRadius="md">
      <HStack justify="space-between">
        <Heading mb={4}>{labels.title}</Heading>
        {(isMyStudentsRoute || user.role === "admin") && (
          <Button onClick={studentModal.onOpen} colorScheme="blue">
            {labels.createBtn}
          </Button>
        )}
      </HStack>
      <Input
        placeholder={labels.search}
        mb={4}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <CreateStudentModal
        isOpen={studentModal.isOpen}
        onClose={studentModal.onClose}
        labels={labels}
        coordinators={coordinators}
        showTeacherFields={false}
        onCreate={handleCreate}
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th onClick={() => handleSort("name")} cursor="pointer">{labels.name} {renderSortIcon("name")}</Th>
            <Th onClick={() => handleSort("mobileNumber")} cursor="pointer">{labels.mobile} {renderSortIcon("mobileNumber")}</Th>
            <Th onClick={() => handleSort("balance")} cursor="pointer">{labels.balance} {renderSortIcon("balance")}</Th>
            <Th onClick={() => handleSort("minimum")} cursor="pointer">{labels.minimum} {renderSortIcon("minimum")}</Th>
            <Th onClick={() => handleSort("status")} cursor="pointer">{labels.status} {renderSortIcon("status")}</Th>
            {user.role === "admin" && !isMyStudentsRoute && <Th>Actions</Th>}
            {(user.role === "admin" || !isMyStudentsRoute) && (
              <Th onClick={() => handleSort("coordinator")} cursor="pointer">Coordinator {renderSortIcon("coordinator")}</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((stu, idx) => (
            <Tr key={stu._id}>
              <Td>{(page - 1) * itemsPerPage + idx + 1}</Td>
              <Td>{`${stu.firstName} ${stu.lastName}`}</Td>
              <Td>{stu.mobileNumber}</Td>
              <Td>{stu.wallet?.balance ?? "-"}</Td>
              <Td>{stu.wallet?.minimum ?? "-"}</Td>
              <Td>{stu.isApproved ? "✔️" : "❌"}</Td>

              {/* Actions for admin on manage page */}
              {user.role === "admin" && !isMyStudentsRoute && (
                <Td>
                  {!stu.coordinator?._id ? (
                    <Select
                      placeholder={labels.approve}
                      size="sm"
                      onChange={(e) =>
                        handleApprove(stu._id, true, e.target.value)
                      }
                    >
                      {coordinators.map((c) => (
                        <option key={c._id} value={c._id}>
                          {`${c.firstName} ${c.lastName}`}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => handleApprove(stu._id, true)}
                        disabled={stu.isApproved}
                      >
                        {labels.approve}
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleApprove(stu._id, false)}
                        disabled={!stu.isApproved}
                      >
                        {labels.disapprove}
                      </Button>
                    </HStack>
                  )}
                </Td>
              )}

              {/* Coordinator column */}
              {(user.role === "admin" || !isMyStudentsRoute) && (
                <Td>
                  {stu.coordinator
                    ? `${stu.coordinator.firstName} ${stu.coordinator.lastName}`
                    : "-"}
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>

      <HStack justify="space-between" mt={4}>
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {labels.prev}
        </Button>
        <Text>
          Page {page} / {totalPages || 1}
        </Text>
        <Button
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          {labels.next}
        </Button>
      </HStack>
    </Box>
  );
};

export default withAuthorization(Students, ["admin", "coordinator"]);
