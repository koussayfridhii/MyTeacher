// // TopUp.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import {
//   Box,
//   Heading,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Button,
//   Input,
//   useColorModeValue,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   FormControl,
//   FormLabel,
//   NumberInput,
//   NumberInputField,
//   useDisclosure,
//   HStack,
//   Text,
// } from "@chakra-ui/react";
// import { useSelector } from "react-redux";
// import { topUpData } from "../data/topUp";

// const TopUp = () => {
//   const token = localStorage.getItem("token");
//   const language = useSelector((state) => state.language.language);
//   const labels = topUpData[language] || topUpData.en;

//   const [users, setUsers] = useState([]);
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [currentAction, setCurrentAction] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [inputValue, setInputValue] = useState(0);

//   // search & pagination state
//   const [studentSearch, setStudentSearch] = useState("");
//   const [teacherSearch, setTeacherSearch] = useState("");
//   const [stuPage, setStuPage] = useState(1);
//   const [teachPage, setTeachPage] = useState(1);
//   const itemsPerPage = 5;

//   const fetchUsers = () => {
//     axios
//       .get(`${import.meta.env.VITE_API_URL}/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setUsers(res.data.users))
//       .catch((err) => console.error(err));
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [token]);

//   const openModal = (user, action) => {
//     setCurrentUser(user);
//     setCurrentAction(action);
//     setInputValue(0);
//     onOpen();
//   };

//   const handleConfirm = () => {
//     const { _id } = currentUser;
//     let endpoint, payload;
//     if (currentAction === "add") {
//       endpoint = "/wallet/add-points";
//       payload = { id: _id, amount: inputValue };
//     } else if (currentAction === "deduct") {
//       endpoint = "/wallet/add-points";
//       payload = { id: _id, amount: -inputValue };
//     } else if (currentAction === "setMin") {
//       endpoint = "/wallet/set-minimum";
//       payload = { id: _id, minBalance: inputValue };
//     }
//     axios
//       .patch(`${import.meta.env.VITE_API_URL}${endpoint}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then(() => {
//         fetchUsers();
//         onClose();
//       })
//       .catch((err) => console.error(err));
//   };

//   const bg = useColorModeValue("white", "gray.800");
//   const color = useColorModeValue("black", "white");

//   const students = useMemo(
//     () =>
//       users.filter(
//         (u) =>
//           u.role === "student" &&
//           `${u.firstName} ${u.lastName}`
//             .toLowerCase()
//             .includes(studentSearch.toLowerCase())
//       ),
//     [users, studentSearch]
//   );
//   const teachers = useMemo(
//     () =>
//       users.filter(
//         (u) =>
//           u.role === "teacher" &&
//           `${u.firstName} ${u.lastName}`
//             .toLowerCase()
//             .includes(teacherSearch.toLowerCase())
//       ),
//     [users, teacherSearch]
//   );

//   const paginate = (data, page) => {
//     const start = (page - 1) * itemsPerPage;
//     return data.slice(start, start + itemsPerPage);
//   };

//   const renderTable = (
//     list,
//     isTeacher = false,
//     search,
//     setSearch,
//     page,
//     setPage
//   ) => (
//     <Box borderWidth={1} borderRadius="md" p={4} bg={bg} color={color} mb={6}>
//       <Heading size="md" mb={4}>
//         {isTeacher ? labels.teachers : labels.students}
//       </Heading>
//       <Input
//         mb={3}
//         placeholder={labels.search}
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setPage(1);
//         }}
//       />
//       <Table variant="simple">
//         <Thead>
//           <Tr>
//             <Th>#</Th>
//             <Th>Name</Th>
//             <Th>{labels.balance}</Th>
//             {!isTeacher && <Th>{labels.minimum}</Th>}
//             <Th>Actions</Th>
//           </Tr>
//         </Thead>
//         <Tbody>
//           {paginate(list, page).map((u, idx) => (
//             <Tr key={u._id}>
//               <Td>{(page - 1) * itemsPerPage + idx + 1}</Td>
//               <Td>{`${u.firstName} ${u.lastName}`}</Td>
//               <Td>{u.wallet?.balance ?? "-"}</Td>
//               {!isTeacher && <Td>{u.wallet?.minimum ?? "-"}</Td>}
//               <Td>
//                 <HStack>
//                   <Button
//                     size="sm"
//                     colorScheme="green"
//                     onClick={() => openModal(u, "add")}
//                   >
//                     {labels.add}
//                   </Button>
//                   <Button
//                     size="sm"
//                     colorScheme="red"
//                     onClick={() => openModal(u, "deduct")}
//                   >
//                     {labels.deduct}
//                   </Button>
//                   {!isTeacher && (
//                     <Button
//                       size="sm"
//                       colorScheme="blue"
//                       onClick={() => openModal(u, "setMin")}
//                     >
//                       {labels.setMin}
//                     </Button>
//                   )}
//                 </HStack>
//               </Td>
//             </Tr>
//           ))}
//         </Tbody>
//       </Table>
//       <HStack justify="space-between" mt={4}>
//         <Button
//           size="sm"
//           disabled={page === 1}
//           onClick={() => setPage(page - 1)}
//         >
//           {labels.prev}
//         </Button>
//         <Text>
//           Page {page} / {Math.ceil(list.length / itemsPerPage)}
//         </Text>
//         <Button
//           size="sm"
//           disabled={page >= Math.ceil(list.length / itemsPerPage)}
//           onClick={() => setPage(page + 1)}
//         >
//           {labels.next}
//         </Button>
//       </HStack>
//     </Box>
//   );

//   return (
//     <Box p={6}>
//       <Heading mb={6}>{labels.title}</Heading>
//       {renderTable(
//         students,
//         false,
//         studentSearch,
//         setStudentSearch,
//         stuPage,
//         setStuPage
//       )}
//       {renderTable(
//         teachers,
//         true,
//         teacherSearch,
//         setTeacherSearch,
//         teachPage,
//         setTeachPage
//       )}

//       <Modal isOpen={isOpen} onClose={onClose} isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>
//             {currentAction === "add" && labels.add}
//             {currentAction === "deduct" && labels.deduct}
//             {currentAction === "setMin" && labels.setMin}
//           </ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FormControl>
//               <FormLabel>
//                 {currentAction === "setMin"
//                   ? labels.enterMin
//                   : labels.enterAmount}
//               </FormLabel>
//               <NumberInput
//                 min={0}
//                 value={inputValue}
//                 onChange={(_, val) => setInputValue(val)}
//               >
//                 <NumberInputField />
//               </NumberInput>
//             </FormControl>
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="ghost" mr={3} onClick={onClose}>
//               {labels.cancel}
//             </Button>
//             <Button colorScheme="blue" onClick={handleConfirm}>
//               {labels.confirm}
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default TopUp;
// TopUp.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Box, Heading, useDisclosure } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import UserTable from "../components/UserTable";
import ActionModal from "../components/ActionModal";
import { topUpData } from "../data/topUp";
import { withAuthorization } from "../HOC/Protect";

const TopUp = () => {
  const token = localStorage.getItem("token");
  const language = useSelector((state) => state.language.language);
  const labels = topUpData[language] || topUpData.en;

  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalProps, setModalProps] = useState({});

  const fetchUsers = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleAction = (user, action) => {
    setModalProps({ user, action });
    onOpen();
  };

  const handleConfirm = (inputValue) => {
    const { user, action } = modalProps;
    const { _id } = user;
    let endpoint, payload;

    if (action === "add") {
      endpoint = "/wallet/add-points";
      payload = { id: _id, amount: inputValue };
    } else if (action === "deduct") {
      endpoint = "/wallet/add-points";
      payload = { id: _id, amount: -inputValue };
    } else if (action === "setMin") {
      endpoint = "/wallet/set-minimum";
      payload = { id: _id, minBalance: inputValue };
    }

    axios
      .patch(`${import.meta.env.VITE_API_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchUsers();
        onClose();
      })
      .catch((err) => console.error(err));
  };

  // Search & pagination state
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

const AuthorizedTopUp = withAuthorization(TopUp, ["admin", "coordinator"]);
export default AuthorizedTopUp;
