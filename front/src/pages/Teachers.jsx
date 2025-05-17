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
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { withAuthorization } from "../HOC/Protect";
import CreateTeacherModal from "../components/CreateUserModal";
import { Link, useLocation } from "react-router-dom";
import { useGetUsers, useApproveUser } from "../hooks/useGetUsers";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Teachers = () => {
  const language = useSelector((state) => state.language.language);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const isMyTeachers = location.pathname.includes("teachers");
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const t = {
    en: {
      title: "Manage Teachers",
      search: "Search...",
      balance: "Balance",
      approve: "Approve",
      disapprove: "Disapprove",
      status: "Status",
      prev: "Previous",
      next: "Next",
      approvedMsg: "Teacher approved",
      disapprovedMsg: "Teacher disapproved",
      errorMsg: "Action failed",
      createBtn: "Create Teacher",
      modalTitle: "New Teacher",
      submit: "Submit",
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      mobile: "Mobile Number",
    },
    fr: {
      title: "Gérer les enseignants",
      search: "Rechercher...",
      balance: "Solde",
      approve: "Approuver",
      disapprove: "Désapprouver",
      status: "Statut",
      prev: "Précédent",
      next: "Suivant",
      approvedMsg: "Enseignant approuvé",
      disapprovedMsg: "Enseignant désapprouvé",
      errorMsg: "Action échouée",
      createBtn: "Créer un enseignant",
      modalTitle: "Nouvel enseignant",
      submit: "Soumettre",
      email: "E-mail",
      password: "Mot de passe",
      firstName: "Prénom",
      lastName: "Nom",
      mobile: "Numéro de mobile",
    },
    ar: {
      title: "إدارة المعلمين",
      search: "ابحث...",
      balance: "الرصيد",
      approve: "الموافقة",
      disapprove: "رفض",
      status: "الحالة",
      prev: "السابق",
      next: "التالي",
      approvedMsg: "تمت الموافقة على المعلم",
      disapprovedMsg: "تم رفض المعلم",
      errorMsg: "فشلت العملية",
      createBtn: "إنشاء معلم",
      modalTitle: "معلم جديد",
      submit: "إرسال",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      mobile: "رقم الجوال",
    },
  };
  const labels = t[language] || t.en;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // React Query hooks: now generic users
  const { data: users = [], isLoading } = useGetUsers();
  const approveMutation = useApproveUser();

  // Filter only teachers from the users list
  const teachers = useMemo(
    () => users.filter((u) => u.role === "teacher"),
    [users]
  );

  // Filtering & pagination on teachers
  const filtered = useMemo(
    () =>
      teachers.filter((t) =>
        `${t.firstName} ${t.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [teachers, search]
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filtered, page]
  );

  const handleApprove = (id, approve) => {
    approveMutation.mutate(
      { id, approve },
      {
        onSuccess: () => {
          toast({
            title: approve ? labels.approvedMsg : labels.disapprovedMsg,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        },
        onError: () =>
          toast({
            title: labels.errorMsg,
            status: "error",
            duration: 3000,
            isClosable: true,
          }),
      }
    );
  };

  const handleCreate = async (data) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/create`,
        { ...data, role: "teacher" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Teacher created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
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

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <Box p={6} bg={"white"} color={"black"} borderRadius="md">
      <HStack justify="space-between">
        <Heading mb={4}>{labels.title}</Heading>
        <Button onClick={onOpen} colorScheme="blue">
          {labels.createBtn}
        </Button>
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

      <CreateTeacherModal
        isOpen={isOpen}
        onClose={onClose}
        labels={labels}
        onCreate={handleCreate}
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>{labels.balance}</Th>
            <Th>{labels.status}</Th>
            <Th>{isMyTeachers ? "Actions" : "Coordinator"}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((tchr, idx) => (
            <Tr key={tchr._id}>
              <Td>{(page - 1) * itemsPerPage + idx + 1}</Td>
              <Td>
                <Link
                  to={tchr._id}
                >{`${tchr.firstName} ${tchr.lastName}`}</Link>
              </Td>
              <Td>{tchr.wallet?.balance ?? "-"}</Td>
              <Td>{tchr.isApproved ? "✔️" : "❌"}</Td>
              {isMyTeachers ? (
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleApprove(tchr._id, true)}
                      disabled={tchr.isApproved}
                    >
                      {labels.approve}
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleApprove(tchr._id, false)}
                      disabled={!tchr.isApproved}
                    >
                      {labels.disapprove}
                    </Button>
                  </HStack>
                </Td>
              ) : tchr.coordinator ? (
                <Td>{`\${tchr.coordinator.firstName} \${tchr.coordinator.lastName}`}</Td>
              ) : (
                <Td>-</Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>

      <HStack justify="space-between" mt={4}>
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          {labels.prev}
        </Button>
        <Text>
          Page {page} / {totalPages || 1}
        </Text>
        <Button
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          {labels.next}
        </Button>
      </HStack>
    </Box>
  );
};

export default withAuthorization(Teachers, ["admin", "coordinator"]);
