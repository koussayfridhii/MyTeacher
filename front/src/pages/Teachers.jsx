import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
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
  useColorModeValue,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { withAuthorization } from "../HOC/Protect";
import CreateTeacherModal from "../components/CreateUserModal";
import { useLocation } from "react-router-dom";

const Teachers = () => {
  const token = localStorage.getItem("token");
  const language = useSelector((state) => state.language.language);
  const toast = useToast();
  const locations = useLocation();
  const isMyTeachers = locations.pathname.includes("myteachers");
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTeachers = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data.users.filter((u) => u.role === "teacher");
        setTeachers(list);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTeachers();
  }, [token]);

  const filtered = useMemo(
    () =>
      teachers.filter((tchr) =>
        `${tchr.firstName} ${tchr.lastName}`
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
    axios
      .patch(
        `${import.meta.env.VITE_API_URL}/users/approve/${id}`,
        { approve },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast({
          title: approve ? labels.approvedMsg : labels.disapprovedMsg,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchTeachers();
      })
      .catch(() =>
        toast({
          title: labels.errorMsg,
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      );
  };

  return (
    <Box
      p={6}
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("black", "white")}
      borderRadius="md"
    >
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
        onCreate={async (data) => {
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
            fetchTeachers();
          } catch {
            toast({
              title: labels.errorMsg,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        }}
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>{labels.balance}</Th>
            <Th>{labels.status}</Th>
            {isMyTeachers ? <Th>Actions</Th> : <Th>Coordinator</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((tchr, idx) => (
            <Tr key={tchr._id}>
              <Td>{(page - 1) * itemsPerPage + idx + 1}</Td>
              <Td>{`${tchr.firstName} ${tchr.lastName}`}</Td>
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
                <Td>{`${tchr.coordinator.firstName} ${tchr.coordinator.lastName}`}</Td>
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

const AuthorizedTeachers = withAuthorization(Teachers, [
  "admin",
  "coordinator",
]);
export default AuthorizedTeachers;
