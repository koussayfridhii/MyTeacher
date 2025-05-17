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
  useColorModeValue,
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
  const isMyStudents = location.pathname.includes("mystudents");
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useGetUsers();
  const approveMutation = useApproveUser();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const t = {
    en: {
      title: isMyStudents ? "My Students" : "Manage Students",
      search: "Search...",
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
    },
    fr: {
      title: isMyStudents ? "Mes étudiants" : "Gérer les étudiants",
      search: "Rechercher...",
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
    },
    ar: {
      title: isMyStudents ? "طلابي" : "إدارة الطلاب",
      search: "ابحث...",
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
    },
  };
  const labels = t[language] || t.en;

  // filter for students
  const allStudents = useMemo(
    () => users.filter((u) => u.role === "student"),
    [users]
  );
  // apply coordinator filter
  const students = useMemo(
    () =>
      isMyStudents && user?._id
        ? allStudents.filter((s) => s.coordinator?._id === user._id)
        : allStudents,
    [allStudents, isMyStudents, user]
  );

  // discounts state
  const [discounts, setDiscounts] = useState({});
  const studentModal = useDisclosure();
  const discountModal = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [existingDiscount, setExistingDiscount] = useState(null);

  // fetch discounts on demand
  const openDiscountModal = (stu) => {
    const ex = discounts[stu._id];
    setSelectedStudent(stu);
    setExistingDiscount(ex);
    discountModal.onOpen();
    // fetch if not present
    if (ex === undefined) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/discount/${stu._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) =>
          setDiscounts((prev) => ({ ...prev, [stu._id]: res.data }))
        )
        .catch(() => setDiscounts((prev) => ({ ...prev, [stu._id]: null })));
    }
  };

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
        title: "Student created",
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

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <Box
      p={6}
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("black", "white")}
      borderRadius="md"
    >
      <HStack justify="space-between">
        <Heading mb={4}>{labels.title}</Heading>
        {isMyStudents && (
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
        onCreate={handleCreate}
      />
      <DiscountCreationModal
        isOpen={discountModal.isOpen}
        onClose={discountModal.onClose}
        student={selectedStudent}
        existingDiscount={existingDiscount}
        token={token}
        labels={labels}
        refresh={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>{labels.balance}</Th>
            <Th>{labels.minimum}</Th>
            <Th>{labels.status}</Th>
            <Th>{labels.discountPct}</Th>
            <Th>{isMyStudents ? "Actions" : "Coordinator"}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((stu, idx) => {
            const disc = discounts[stu._id];
            return (
              <Tr key={stu._id}>
                <Td>{(page - 1) * itemsPerPage + idx + 1}</Td>
                <Td>{`${stu.firstName} ${stu.lastName}`}</Td>
                <Td>{stu.wallet?.balance ?? "-"}</Td>
                <Td>{stu.wallet?.minimum ?? "-"}</Td>
                <Td>{stu.isApproved ? "✔️" : "❌"}</Td>
                <Td>
                  {disc
                    ? `${disc.percent}% ${disc.approved ? "✔️" : "❌"}`
                    : "-"}
                </Td>
                {isMyStudents ? (
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
                      <Button
                        size="sm"
                        colorScheme="purple"
                        onClick={() => openDiscountModal(stu)}
                      >
                        {disc ? labels.editDiscount : labels.createDiscount}
                      </Button>
                    </HStack>
                  </Td>
                ) : (
                  <Td>
                    {stu.coordinator
                      ? `${stu.coordinator.firstName} ${stu.coordinator.lastName}`
                      : "-"}
                  </Td>
                )}
              </Tr>
            );
          })}
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
