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
  Icon,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useSelector } from "react-redux";
import { withAuthorization } from "../HOC/Protect";
import CreateTeacherModal from "../components/CreateUserModal";
import EditTeacherModal from "../components/EditTeacherModal"; // Import EditTeacherModal
import { Link } from "react-router-dom";
import { useGetUsers, useApproveUser } from "../hooks/useGetUsers";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Teachers = () => {
  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user);
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure(); // For Edit Modal
  const [selectedTeacher, setSelectedTeacher] = useState(null); // To store teacher being edited
  const isMyTeachers = user.role === "admin";
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const t = {
    en: {
      title: "Manage Teachers",
      search: "Search...",
      balance: "Balance",
      subject: "Subject",
      program: "Program",
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
      maxWeeklyHours: "Max Weekly Hours", // Added for English
      editTeacher: "Edit Teacher",       // Added for English
      save: "Save",                     // Added for English
      editBtn: "Edit",                  // Added for English
      cancel: "Cancel",                 // Added for English
    },
    fr: {
      title: "Gérer les enseignants",
      search: "Rechercher...",
      balance: "Solde",
      subject: "Matière",
      program: "Programme",
      approve: "Approuver",
      disapprove: "Désapprouver",
      status: "Statut",
      prev: "Précédent",
      next: "Suivant",
      approvedMsg: "Enseignant approuvé",
      disapprovedMsg: "Enseignant désapprouvé",
      errorMsg: "Échec de l'action",
      createBtn: "Créer un enseignant",
      modalTitle: "Nouvel enseignant",
      submit: "Soumettre",
      email: "Email",
      password: "Mot de passe",
      firstName: "Prénom",
      lastName: "Nom de famille",
      mobile: "Numéro de téléphone",
      maxWeeklyHours: "Heures max/semaine",
      editTeacher: "Modifier Enseignant",
      save: "Enregistrer",
      editBtn: "Modifier",
      cancel: "Annuler",
    },
    ar: {
      title: "إدارة المعلمين",
      search: "بحث...",
      balance: "الرصيد",
      subject: "المادة",
      program: "البرنامج",
      approve: "الموافقة",
      disapprove: "رفض",
      status: "الحالة",
      prev: "السابق",
      next: "التالي",
      approvedMsg: "تمت الموافقة على المعلم",
      disapprovedMsg: "تم رفض المعلم",
      errorMsg: "فشل الإجراء",
      createBtn: "إنشاء معلم",
      modalTitle: "معلم جديد",
      submit: "إرسال",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      mobile: "رقم الهاتف",
      maxWeeklyHours: "ساعات العمل القصوى/الأسبوع",
      editTeacher: "تعديل بيانات المعلم",
      save: "حفظ",
      editBtn: "تعديل",
      cancel: "إلغاء",
    },
  };

  const labels = t[language] || t.en;
  labels.en = { // Ensure English fallback has all keys
    title: "Manage Teachers",
    search: "Search...",
    balance: "Balance",
    subject: "Subject",
    program: "Program",
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
    maxWeeklyHours: "Max Weekly Hours",
    editTeacher: "Edit Teacher",
    save: "Save",
    editBtn: "Edit",
    cancel: "Cancel",
  };


  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const { data: users = [], isLoading } = useGetUsers();
  const approveMutation = useApproveUser();

  const teachers = useMemo(
    () => users.filter((u) => u.role === "teacher"),
    [users]
  );

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedTeachers = useMemo(() => {
    let sorted = [...teachers];
    if (sortColumn) {
      sorted.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === "name") {
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
        } else if (sortColumn === "balance") {
          aValue = a.wallet?.balance ?? 0;
          bValue = b.wallet?.balance ?? 0;
        } else if (sortColumn === "programs") {
          aValue = Array.isArray(a.programs) ? a.programs.join(", ") : a.programs || "";
          bValue = Array.isArray(b.programs) ? b.programs.join(", ") : b.programs || "";
        } else if (sortColumn === "status") {
          aValue = a.isApproved ? "Approved" : "Not Approved";
          bValue = b.isApproved ? "Approved" : "Not Approved";
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
  }, [teachers, sortColumn, sortDirection]);

  // Enhanced filter to include name, mobile, subject or programs
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return sortedTeachers;
    return sortedTeachers.filter((tchr) => {
      const name = `${tchr.firstName} ${tchr.lastName}`.toLowerCase();
      const mobile = (tchr.mobileNumber || "").toLowerCase();
      const subject = (tchr.subject || "").toLowerCase();
      const programs = Array.isArray(tchr.programs)
        ? tchr.programs.join(", ").toLowerCase()
        : (tchr.programs || "").toLowerCase();
      return (
        name.includes(query) ||
        mobile.includes(query) ||
        subject.includes(query) ||
        programs.includes(query)
      );
    });
  }, [sortedTeachers, search]);

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
      toast({ title: labels.errorMsg, status: "error", duration: 3000 });
    }
  };
  if (isLoading)
    return (
      <Center w="full" height="100vh">
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Box p={6} bg="white" color="black" borderRadius="md">
      <HStack justify="space-between">
        <Heading mb={4}>{labels.title}</Heading>
        {isMyTeachers && (
          <Button onClick={onCreateOpen} colorScheme="blue">
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

      <CreateTeacherModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        labels={labels}
        onCreate={handleCreate}
        showTeacherFields
      />

      {selectedTeacher && (
        <EditTeacherModal
          isOpen={isEditOpen}
          onClose={() => {
            onEditClose();
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
          labels={labels}
        />
      )}

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th onClick={() => handleSort("name")} cursor="pointer">
              {language === "en" ? "Name" : language === "fr" ? "Nom" : "الاسم"} {renderSortIcon("name")}
            </Th>
            <Th onClick={() => handleSort("mobileNumber")} cursor="pointer">Mobile {renderSortIcon("mobileNumber")}</Th>

            {isMyTeachers && <Th onClick={() => handleSort("rib")} cursor="pointer">RIB {renderSortIcon("rib")}</Th>}
            {isMyTeachers && <Th onClick={() => handleSort("balance")} cursor="pointer">{labels.balance} {renderSortIcon("balance")}</Th>}
            <Th onClick={() => handleSort("subject")} cursor="pointer">{labels.subject} {renderSortIcon("subject")}</Th>
            <Th onClick={() => handleSort("programs")} cursor="pointer">{labels.program} {renderSortIcon("programs")}</Th>
            {isMyTeachers && <Th onClick={() => handleSort("max_hours_per_week")} cursor="pointer">{labels.maxWeeklyHours} {renderSortIcon("max_hours_per_week")}</Th>}
            <Th onClick={() => handleSort("status")} cursor="pointer">{labels.status} {renderSortIcon("status")}</Th>
            {isMyTeachers && (
              <Th>{language === "ar" ? "التفاعل" : "Actions"}</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((tchr, idx) => (
            <Tr key={tchr._id}>
              <Td>{(page - 1) * itemsPerPage + idx + 1}</Td>
              <Td>
                <Link to={`/profile/${tchr._id}`}>
                  {`${tchr.firstName} ${tchr.lastName}`}
                </Link>
              </Td>
              <Td>{tchr.mobileNumber || "-"}</Td>
              {isMyTeachers && <Td>{tchr.rib ?? "-"}</Td>}
              {isMyTeachers && <Td>{tchr.wallet?.balance ?? "-"}</Td>}
              <Td>{tchr.subject ?? "-"}</Td>
              <Td>
                {Array.isArray(tchr.programs)
                  ? tchr.programs.join(", ")
                  : tchr.programs ?? "-"}
              </Td>
              {isMyTeachers && <Td>{tchr.max_hours_per_week ?? "-"}</Td>}
              <Td>{tchr.isApproved ? "✔️" : "❌"}</Td>
              {isMyTeachers && (
                <Td>
                  <HStack spacing={2}>
                     <Button
                       size="sm"
                       colorScheme="blue"
                       onClick={() => {
                         setSelectedTeacher(tchr);
                         onEditOpen();
                       }}
                     >
                       {labels.editBtn || "Edit"}
                     </Button>
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
