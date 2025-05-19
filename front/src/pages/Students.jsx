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
import { useLocation } from "react-router-dom";
import { withAuthorization } from "../HOC/Protect";
import CreateStudentModal from "../components/CreateUserModal";
import DiscountCreationModal from "../components/DiscountCreationModal";
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

  // modal controls
  const studentModal = useDisclosure();
  const discountModal = useDisclosure();

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

  // show all students for admin, or filter by coordinator when on "My Students"
  const students = useMemo(() => {
    if (user.role === "admin") return allStudents;
    if (isMyStudentsRoute && user?._id)
      return allStudents.filter((s) => s.coordinator?._id === user._id);
    return allStudents;
  }, [allStudents, isMyStudentsRoute, user]);

  // search + pagination
  const filtered = useMemo(
    () =>
      students.filter((stu) =>
        `${stu.firstName} ${stu.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
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
  if (isLoading) return <Text>Loading...</Text>;

  return (
    <Box p={6} bg={"white"} color={"black"} borderRadius="md">
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
            <Th>{labels.name}</Th>
            <Th>{labels.mobile}</Th>
            <Th>{labels.balance}</Th>
            <Th>{labels.minimum}</Th>
            <Th>{labels.status}</Th>
            {((isMyStudentsRoute && user.role === "coordinator") ||
              (!isMyStudentsRoute && user.role === "admin")) && (
              <Th>Actions</Th>
            )}
            <Th>{!isMyStudentsRoute && "Coordinator"}</Th>
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
              {(isMyStudentsRoute || user.role === "admin") && (
                <Td>
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
                </Td>
              )}
              {(user.role === "admin" || !isMyStudentsRoute) && (
                <Td>{`${stu.coordinator.firstName} ${stu.coordinator.lastName}`}</Td>
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

export default withAuthorization(Students, ["admin", "coordinator"]);
