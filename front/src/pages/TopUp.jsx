import React, { useState, useMemo } from "react";
import { Box, Heading, useDisclosure, Text } from "@chakra-ui/react";
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
  const user = useSelector((state) => state.user.user);
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

  // filter by coordinator relationship
  const filteredUsers = useMemo(
    () => users.filter((u) => u.coordinator?._id === user._id),
    [users, user]
  );

  const students = useMemo(
    () =>
      filteredUsers.filter(
        (u) =>
          u.role === "student" &&
          `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(studentSearch.toLowerCase())
      ),
    [filteredUsers, studentSearch]
  );

  const teachers = useMemo(
    () =>
      filteredUsers.filter(
        (u) =>
          u.role === "teacher" &&
          `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(teacherSearch.toLowerCase())
      ),
    [filteredUsers, teacherSearch]
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalProps, setModalProps] = useState({});

  const handleAction = (user, action) => {
    setModalProps({ user, action });
    onOpen();
  };

  const handleConfirm = (inputValue) => {
    const { user: sel, action } = modalProps;
    let endpoint, payload;

    switch (action) {
      case "add":
        endpoint = "/wallet/add-points";
        payload = { id: sel._id, amount: inputValue };
        break;
      case "deduct":
        endpoint = "/wallet/add-points";
        payload = { id: sel._id, amount: -inputValue };
        break;
      case "setMin":
        endpoint = "/wallet/set-minimum";
        payload = { id: sel._id, minBalance: inputValue };
        break;
      default:
        return;
    }

    patchWallet({ endpoint, payload });
    onClose();
  };

  if (isLoading) return <Text>Loading...</Text>;

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

export default withAuthorization(TopUp, ["admin", "coordinator"]);
