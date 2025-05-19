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
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { withAuthorization } from "../HOC/Protect";
import CreateTeacherModal from "../components/CreateUserModal";
import { Link } from "react-router-dom";
import { useGetUsers, useApproveUser } from "../hooks/useGetUsers";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const Teachers = () => {
  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    },
    fr: {
      /* ... French labels ... */
    },
    ar: {
      /* ... Arabic labels ... */
    },
  };
  const labels = t[language] || t.en;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const { data: users = [], isLoading } = useGetUsers();
  const approveMutation = useApproveUser();

  const teachers = useMemo(
    () => users.filter((u) => u.role === "teacher"),
    [users]
  );

  // Enhanced filter to include name, mobile, subject or programs
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return teachers;
    return teachers.filter((tchr) => {
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
  }, [teachers, search]);

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
          <Button onClick={onOpen} colorScheme="blue">
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
        isOpen={isOpen}
        onClose={onClose}
        labels={labels}
        onCreate={handleCreate}
        showTeacherFields
      />

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>Mobile</Th>

            {isMyTeachers && <Th>RIB</Th>}
            {isMyTeachers && <Th>{labels.balance}</Th>}
            <Th>{labels.subject}</Th>
            <Th>{labels.program}</Th>
            <Th>{labels.status}</Th>
            {isMyTeachers && <Th>Actions</Th>}
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
              <Td>{tchr.isApproved ? "✔️" : "❌"}</Td>
              {isMyTeachers && (
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
