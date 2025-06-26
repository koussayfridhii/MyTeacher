import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Spinner,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  IconButton,
  Tooltip,
  Tag,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, ViewIcon } from "@chakra-ui/icons";
import { useGroups } from "../hooks/useGroups";
import { useGetUsers } from "../hooks/useGetUsers"; // To fetch teachers and students
import { useFetchPlans } from "../hooks/useFetchPlans"; // Corrected import for fetching plans
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { withAuthorization } from "../HOC/Protect"; // Import withAuthorization

const GroupsPage = () => {
  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addStudentToGroup,
    group: groupDetails,
    fetchGroupById,
    setGroup,
  } = useGroups();

  const { users: allUsers, isLoading: usersLoading } = useGetUsers();
  const { plans: allPlans, isLoading: plansLoading } = useFetchPlans();
  const language = useSelector((state) => state.language.language);
  const currentUser = useSelector((state) => state.user.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroupForDelete, setSelectedGroupForDelete] = useState(null);
  const [selectedGroupForStudent, setSelectedGroupForStudent] = useState(null);


  const {
    register: createFormRegister,
    handleSubmit: createFormHandleSubmit,
    reset: createFormReset,
    control: createFormControl,
    formState: { errors: createFormErrors },
  } = useForm();

  const {
    handleSubmit: studentFormHandleSubmit,
    reset: studentFormReset,
    control: studentFormControl, // Added control for the student form
    register: studentFormRegister, // Keep register if needed elsewhere, though Controller is preferred for Chakra UI selects
    formState: { errors: studentFormErrors },
  } = useForm();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const teachers = useMemo(() => allUsers.filter(user => user.role === 'teacher'), [allUsers]);
  const students = useMemo(() => allUsers.filter(user => user.role === 'student'), [allUsers]);

  const filteredAndSortedGroups = useMemo(() => {
    let filtered = groups;
    if (searchTerm) {
      filtered = groups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.teacher && `${group.teacher.firstName} ${group.teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (group.plan && group.plan.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'teacher') {
        aValue = a.teacher ? `${a.teacher.firstName} ${a.teacher.lastName}` : '';
        bValue = b.teacher ? `${b.teacher.firstName} ${b.teacher.lastName}` : '';
      } else if (sortConfig.key === 'plan') {
        aValue = a.plan ? a.plan.name : '';
        bValue = b.plan ? b.plan.name : '';
      } else if (sortConfig.key === 'students') {
        aValue = a.students ? a.students.length : 0;
        bValue = b.students ? b.students.length : 0;
      }


      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [groups, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const openCreateModal = () => {
    createFormReset({ name: "", subject: "", teacher: "", level: "", plan: "", comments: "" });
    setIsCreateModalOpen(true);
  };
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openDetailsModal = async (groupId) => {
    await fetchGroupById(groupId); // Fetches and sets groupDetails
    setIsDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setGroup(null); // Clear details when closing
    setIsDetailsModalOpen(false);
  };

  const openAddStudentModal = (group) => {
    setSelectedGroupForStudent(group);
    studentFormReset({ studentId: ""});
    setIsAddStudentModalOpen(true);
  };
  const closeAddStudentModal = () => {
    setSelectedGroupForStudent(null);
    setIsAddStudentModalOpen(false);
  };

  const openDeleteDialog = (group) => {
    setSelectedGroupForDelete(group);
    setIsDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => {
    setSelectedGroupForDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleCreateGroup = async (data) => {
    try {
      await createGroup(data);
      closeCreateModal();
    } catch (error) {
      // Error is already logged in useGroups, form can display its own errors
      console.error("Create group failed on page:", error);
    }
  };

  const handleAddStudentToGroup = async (data) => {
    if (!selectedGroupForStudent) return;
    try {
      await addStudentToGroup(selectedGroupForStudent._id, data.studentId);
      closeAddStudentModal();
    } catch (error) {
      console.error("Add student to group failed on page:", error);
        // Potentially set an error message for the modal form here
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupForDelete) return;
    try {
      await deleteGroup(selectedGroupForDelete._id);
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete group failed on page:", error);
    }
  };

  const canManageGroups = currentUser?.role === 'admin' || currentUser?.role === 'coordinator';

  if (groupsLoading && groups.length === 0) return <Spinner />;
  if (groupsError) return <Text color="red.500">Error loading groups: {groupsError}</Text>;

  const translations = {
    groupsPageTitle: { en: "Manage Groups", ar: "إدارة المجموعات", fr: "Gérer les Groupes" },
    searchPlaceholder: { en: "Search groups...", ar: "ابحث في المجموعات...", fr: "Rechercher des groupes..." },
    createGroupBtn: { en: "Create Group", ar: "إنشاء مجموعة", fr: "Créer un Groupe" },
    name: { en: "Name", ar: "الاسم", fr: "Nom" },
    subject: { en: "Subject", ar: "المادة", fr: "Matière" },
    teacher: { en: "Teacher", ar: "المعلم", fr: "Enseignant" },
    level: { en: "Level", ar: "المستوى", fr: "Niveau" },
    plan: { en: "Plan", ar: "الخطة", fr: "Plan" },
    students: { en: "Students", ar: "الطلاب", fr: "Étudiants" },
    actions: { en: "Actions", ar: "الإجراءات", fr: "Actions" },
    comments: { en: "Comments", ar: "تعليقات", fr: "Commentaires" },
    maxStudents: { en: "Max Students", ar: "الحد الأقصى للطلاب", fr: "Max Étudiants" },
    addGroup: { en: "Add Group", ar: "إضافة مجموعة", fr: "Ajouter un Groupe" },
    selectTeacher: { en: "Select Teacher", ar: "اختر معلمًا", fr: "Sélectionner un Enseignant" },
    selectPlan: { en: "Select Plan", ar: "اختر خطة", fr: "Sélectionner un Plan" },
    selectStudent: { en: "Select Student", ar: "اختر طالبًا", fr: "Sélectionner un Étudiant" },
    addStudentBtn: { en: "Add Student", ar: "إضافة طالب", fr: "Ajouter Étudiant" },
    noStudentsInGroup: { en: "No students in this group yet.", ar: "لا يوجد طلاب في هذه المجموعة بعد.", fr: "Aucun étudiant dans ce groupe pour le moment." },
    deleteConfirmTitle: { en: "Delete Group", ar: "حذف المجموعة", fr: "Supprimer le Groupe" },
    deleteConfirmText: { en: "Are you sure you want to delete this group? This action cannot be undone.", ar: "هل أنت متأكد أنك تريد حذف هذه المجموعة؟ لا يمكن التراجع عن هذا الإجراء.", fr: "Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible." },
    cancel: { en: "Cancel", ar: "إلغاء", fr: "Annuler" },
    delete: { en: "Delete", ar: "حذف", fr: "Supprimer" },
    viewDetails: { en: "View Details", ar: "عرض التفاصيل", fr: "Voir les Détails" },
    groupDetailsTitle: { en: "Group Details", ar: "تفاصيل المجموعة", fr: "Détails du Groupe" },
    close: { en: "Close", ar: "إغلاق", fr: "Fermer" },
    currentStudents: { en: "Current Students", ar: "الطلاب الحاليون", fr: "Étudiants Actuels" },
    groupFull: { en: "Group is full.", ar: "المجموعة ممتلئة.", fr: "Le groupe est complet." },
    studentRequired: { en: "Student is required.", ar: "الطالب مطلوب.", fr: "L'étudiant est requis." },

  };

  const t = (key) => translations[key]?.[language] || translations[key]?.en;


  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Text fontSize="2xl" fontWeight="bold">{t('groupsPageTitle')}</Text>
        {canManageGroups && <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={openCreateModal}>{t('createGroupBtn')}</Button>}
      </Flex>
      <Input
        placeholder={t('searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={5}
      />
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th onClick={() => requestSort("name")}>{t('name')}</Th>
            <Th onClick={() => requestSort("subject")}>{t('subject')}</Th>
            <Th onClick={() => requestSort("teacher")}>{t('teacher')}</Th>
            <Th onClick={() => requestSort("level")}>{t('level')}</Th>
            <Th onClick={() => requestSort("plan")}>{t('plan')}</Th>
            <Th onClick={() => requestSort("students")}>{t('students')}</Th>
            <Th>{t('actions')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {groupsLoading && groups.length === 0 ? (
            <Tr><Td colSpan={7} textAlign="center"><Spinner /></Td></Tr>
          ) : filteredAndSortedGroups.map((group) => (
            <Tr key={group._id}>
              <Td>{group.name}</Td>
              <Td>{group.subject}</Td>
              <Td>{group.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : "N/A"}</Td>
              <Td>{group.level}</Td>
              <Td>{group.plan ? group.plan.name : "N/A"}</Td>
              <Td>{group.students?.length || 0} / {group.maxStudents}</Td>
              <Td>
                <Tooltip label={t('viewDetails')} placement="top">
                  <IconButton icon={<ViewIcon />} variant="ghost" onClick={() => openDetailsModal(group._id)} mr={2}/>
                </Tooltip>
                 {canManageGroups && (
                   <>
                    <Tooltip label={t('addStudentBtn')} placement="top">
                        <IconButton icon={<AddIcon />} variant="ghost" onClick={() => openAddStudentModal(group)} mr={2} isDisabled={group.students?.length >= group.maxStudents}/>
                    </Tooltip>
                    <Tooltip label={t('delete')} placement="top">
                        <IconButton icon={<DeleteIcon />} variant="ghost" colorScheme="red" onClick={() => openDeleteDialog(group)}/>
                    </Tooltip>
                   </>
                 )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Create Group Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('addGroup')}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={createFormHandleSubmit(handleCreateGroup)}>
            <ModalBody pb={6}>
              <FormControl isInvalid={createFormErrors.name}>
                <FormLabel>{t('name')}</FormLabel>
                <Input {...createFormRegister("name", { required: "Name is required" })} />
              </FormControl>
              <FormControl mt={4} isInvalid={createFormErrors.subject}>
                <FormLabel>{t('subject')}</FormLabel>
                <Input {...createFormRegister("subject", { required: "Subject is required" })} />
              </FormControl>
              <FormControl mt={4} isInvalid={createFormErrors.teacher}>
                <FormLabel>{t('teacher')}</FormLabel>
                 <Controller
                    name="teacher"
                    control={createFormControl}
                    rules={{ required: "Teacher is required" }}
                    render={({ field }) => (
                        <Select placeholder={t('selectTeacher')} {...field} isLoading={usersLoading}>
                        {teachers.map(teacher => (
                            <option key={teacher._id} value={teacher._id}>{teacher.firstName} {teacher.lastName}</option>
                        ))}
                        </Select>
                    )}
                    />
              </FormControl>
              <FormControl mt={4} isInvalid={createFormErrors.level}>
                <FormLabel>{t('level')}</FormLabel>
                <Input {...createFormRegister("level", { required: "Level is required" })} />
              </FormControl>
              <FormControl mt={4} isInvalid={createFormErrors.plan}>
                <FormLabel>{t('plan')}</FormLabel>
                <Controller
                    name="plan"
                    control={createFormControl}
                    rules={{ required: "Plan is required" }}
                    render={({ field }) => (
                        <Select placeholder={t('selectPlan')} {...field} isLoading={plansLoading}>
                        {allPlans.map(plan => (
                            <option key={plan._id} value={plan._id}>{plan.name} ({t('maxStudents')}: {plan.maxStudentsPerGroup})</option>
                        ))}
                        </Select>
                    )}
                    />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>{t('comments')}</FormLabel>
                <Textarea {...createFormRegister("comments")} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit" isLoading={groupsLoading}>
                {t('addGroup')}
              </Button>
              <Button onClick={closeCreateModal}>{t('cancel')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Group Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('groupDetailsTitle')}: {groupDetails?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {groupsLoading && !groupDetails ? <Spinner/> : groupDetails ? (
                <>
                    <Text><strong>{t('subject')}:</strong> {groupDetails.subject}</Text>
                    <Text><strong>{t('teacher')}:</strong> {groupDetails.teacher ? `${groupDetails.teacher.firstName} ${groupDetails.teacher.lastName}` : "N/A"}</Text>
                    <Text><strong>{t('level')}:</strong> {groupDetails.level}</Text>
                    <Text><strong>{t('plan')}:</strong> {groupDetails.plan ? groupDetails.plan.name : "N/A"}</Text>
                    <Text><strong>{t('maxStudents')}:</strong> {groupDetails.maxStudents}</Text>
                    <Text><strong>{t('comments')}:</strong> {groupDetails.comments || "N/A"}</Text>
                    <Text mt={4} fontWeight="bold">{t('currentStudents')} ({groupDetails.students?.length || 0} / {groupDetails.maxStudents}):</Text>
                    {groupDetails.students && groupDetails.students.length > 0 ? (
                        <ul>
                            {groupDetails.students.map(student => (
                                <li key={student._id}>{student.firstName} {student.lastName} ({student.email})</li>
                            ))}
                        </ul>
                    ) : <Text>{t('noStudentsInGroup')}</Text>}
                </>
            ) : <Text>Group not found or error loading details.</Text>}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDetailsModal}>{t('close')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


      {/* Add Student to Group Modal */}
      <Modal isOpen={isAddStudentModalOpen} onClose={closeAddStudentModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('addStudentBtn')} {t('to')} {selectedGroupForStudent?.name}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={studentFormHandleSubmit(handleAddStudentToGroup)}>
            <ModalBody pb={6}>
              <Text mb={2}>
                {t('students')}: {selectedGroupForStudent?.students?.length || 0} / {selectedGroupForStudent?.maxStudents}
              </Text>
              {selectedGroupForStudent && selectedGroupForStudent.students?.length >= selectedGroupForStudent.maxStudents && (
                <Tag colorScheme="red" mb={3}>{t('groupFull')}</Tag>
              )}
              <FormControl isInvalid={studentFormErrors.studentId} isDisabled={selectedGroupForStudent && selectedGroupForStudent.students?.length >= selectedGroupForStudent.maxStudents}>
                <FormLabel>{t('selectStudent')}</FormLabel>
                <Controller
                    name="studentId"
                    control={studentFormControl}
                    rules={{ required: t('studentRequired') || "Student is required" }} // Added translation
                    render={({ field }) => (
                        <Select placeholder={t('selectStudent')} {...field} isLoading={usersLoading} >
                        {students
                            .filter(s => !selectedGroupForStudent?.students.find(gs => gs._id === s._id)) // Filter out already added students
                            .map(student => (
                            <option key={student._id} value={student._id}>{student.firstName} {student.lastName} ({student.email})</option>
                        ))}
                        </Select>
                    )}
                    />
                {studentFormErrors.studentId && <Text color="red.500">{studentFormErrors.studentId.message}</Text>}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                isLoading={groupsLoading}
                isDisabled={selectedGroupForStudent && selectedGroupForStudent.students?.length >= selectedGroupForStudent.maxStudents}
                >
                {t('addStudentBtn')}
              </Button>
              <Button onClick={closeAddStudentModal}>{t('cancel')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={undefined} // No specific ref needed here
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('deleteConfirmTitle')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {t('deleteConfirmText')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={closeDeleteDialog}>
                {t('cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDeleteGroup} ml={3} isLoading={groupsLoading}>
                {t('delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default withAuthorization(GroupsPage, ["admin", "coordinator"]);
