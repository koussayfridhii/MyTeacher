import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

const EditTeacherModal = ({ isOpen, onClose, teacher, labels }) => {
  const [maxHours, setMaxHours] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (teacher) {
      setMaxHours(teacher.max_hours_per_week !== null && teacher.max_hours_per_week !== undefined ? String(teacher.max_hours_per_week) : "");
    }
  }, [teacher]);

  const handleSubmit = async () => {
    if (!teacher) return;
    setLoading(true);
    const hoursValue = maxHours.trim() === "" ? null : Number(maxHours);

    if (hoursValue !== null && (isNaN(hoursValue) || hoursValue < 0)) {
      toast({
        title: "Invalid Input",
        description: "Max hours must be a non-negative number or empty.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${teacher._id}`,
        { max_hours_per_week: hoursValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Teacher Updated",
        description: "Max weekly hours updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Could not update teacher.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{labels.editTeacher || "Edit Teacher"} - {teacher.firstName} {teacher.lastName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel htmlFor="max_hours_per_week">{labels.maxWeeklyHours || "Max Weekly Hours"}</FormLabel>
            <Input
              id="max_hours_per_week"
              type="number"
              placeholder="Enter max hours or leave blank for no limit"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              min="0"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            {labels.cancel || "Cancel"}
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            {loading ? <Spinner size="sm" /> : (labels.save || "Save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTeacherModal;
