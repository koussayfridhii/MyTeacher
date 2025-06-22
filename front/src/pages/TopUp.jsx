import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  useDisclosure,
  Text,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import UserTable from "../components/UserTable";
import ActionModal from "../components/ActionModal";
import { topUpData } from "../data/topUp";
import { withAuthorization } from "../HOC/Protect";
import { useGetUsers } from "../hooks/useGetUsers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const TopUp = () => {
  const language = useSelector((state) => state.language.language);
  const labels = topUpData[language] || topUpData.en;

  const { data: users = [], isLoading } = useGetUsers();
  const queryClient = useQueryClient();
  const { mutate: patchWallet } = useMutation({
    mutationFn: ({ endpoint, payload }) =>
      axios.patch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        payload,
        getAuthConfig()
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [stuPage, setStuPage] = useState(1);
  const [teachPage, setTeachPage] = useState(1);
  const itemsPerPage = 5;

  const students = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "student" &&
          `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(studentSearch.toLowerCase())
      ),
    [users, studentSearch]
  );

  const teachers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "teacher" &&
          `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(teacherSearch.toLowerCase())
      ),
    [users, teacherSearch]
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalProps, setModalProps] = useState({});

  const handleAction = (user, action) => {
    setModalProps({ user, action });
    onOpen();
  };

  // now receives amount and reason
  const handleConfirm = (amount, reason) => {
    const { user: sel, action } = modalProps;
    let endpoint, payload;

    switch (action) {
      case "add":
        endpoint = "/wallet/add-points";
        payload = { id: sel._id, amount, reason };
        break;
      case "deduct":
        endpoint = "/wallet/add-points";
        payload = { id: sel._id, amount: -amount, reason };
        break;
      case "setMin":
        endpoint = "/wallet/set-minimum";
        payload = { id: sel._id, minBalance: amount };
        break;
      default:
        return;
    }

    patchWallet({ endpoint, payload });
    onClose();
  };
  if (isLoading)
    return (
      <Center w="full" h="100vh">
        {" "}
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Box p={6}>
      <Heading mb={6}>{labels.title}</Heading>

      <UserTable
        data={students}
        labels={labels}
        isTeacher={false}
        searchValue={studentSearch}
        onSearchChange={setStudentSearch}
        page={stuPage}
        onPageChange={setStuPage}
        itemsPerPage={itemsPerPage}
        onAction={handleAction}
      />

      <UserTable
        data={teachers}
        labels={labels}
        isTeacher={true}
        searchValue={teacherSearch}
        onSearchChange={setTeacherSearch}
        page={teachPage}
        onPageChange={setTeachPage}
        itemsPerPage={itemsPerPage}
        onAction={handleAction}
      />

      <ActionModal
        isOpen={isOpen}
        onClose={onClose}
        labels={labels}
        modalProps={modalProps}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};

export default withAuthorization(TopUp, ["admin"]);
