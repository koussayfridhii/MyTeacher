import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const DiscountCreationModal = ({
  isOpen,
  onClose,
  student,
  existingDiscount,
  token,
  labels,
  refresh,
}) => {
  const toast = useToast();
  const [percent, setPercent] = useState(0);
  const [maxUsage, setMaxUsage] = useState(1);

  // if editing, prefill
  useEffect(() => {
    if (existingDiscount) {
      setPercent(existingDiscount.percent);
      setMaxUsage(existingDiscount.maxUsage);
    } else {
      setPercent(0);
      setMaxUsage(1);
    }
  }, [existingDiscount]);

  const handleSubmit = async () => {
    try {
      const payload = { user: student._id, percent, maxUsage };
      let res;
      if (existingDiscount) {
        // update: delete then recreate? or patch endpoint
        res = await axios.patch(
          `${import.meta.env.VITE_API_URL}/discount/edit/${
            existingDiscount._id
          }`,
          { percent, maxUsage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/discount/create`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast({
        title: "Discount saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      refresh();
    } catch (err) {
      toast({
        title: err.response?.data?.message || labels.errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/discount/${existingDiscount._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Discount deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      refresh();
    } catch (err) {
      toast({
        title: labels.errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {existingDiscount ? "Edit Discount" : labels.modalTitle}
        </ModalHeader>
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Percent</FormLabel>
            <NumberInput
              min={0}
              max={100}
              value={percent}
              onChange={(val) => setPercent(Number(val))}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Max Usage</FormLabel>
            <NumberInput
              min={1}
              value={maxUsage}
              onChange={(val) => setMaxUsage(Number(val))}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} colorScheme="blue" mr={3}>
            {labels.submit}
          </Button>
          {existingDiscount && (
            <Button onClick={handleDelete} mr={3}>
              {"Delete"}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DiscountCreationModal;
