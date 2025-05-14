import React from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

const CreateUserModal = ({ isOpen, onClose, onCreate, labels }) => {
  const language = useSelector((state) => state.language.language);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    await onCreate(data);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <ModalOverlay />
      <ModalContent dir={language === "ar" ? "rtl" : "ltr"}>
        <ModalHeader textAlign="center" dir={language === "ar" ? "rtl" : "ltr"}>
          {labels.modalTitle}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody dir={language === "ar" ? "rtl" : "ltr"}>
          <FormControl mb={3} isInvalid={errors.email}>
            <FormLabel>{labels.email}</FormLabel>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
            />
          </FormControl>
          <FormControl mb={3} isInvalid={errors.password}>
            <FormLabel>{labels.password}</FormLabel>
            <Input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min length is 6" },
              })}
              type="password"
            />
          </FormControl>
          <FormControl mb={3} isInvalid={errors.firstName}>
            <FormLabel>{labels.firstName}</FormLabel>
            <Input
              {...register("firstName", {
                required: "First name is required",
              })}
            />
          </FormControl>
          <FormControl mb={3} isInvalid={errors.lastName}>
            <FormLabel>{labels.lastName}</FormLabel>
            <Input
              {...register("lastName", {
                required: "Last name is required",
              })}
            />
          </FormControl>
          <FormControl mb={3} isInvalid={errors.mobileNumber}>
            <FormLabel>{labels.mobile}</FormLabel>
            <Input
              {...register("mobileNumber", {
                required: "Mobile number is required",
                minLength: { value: 6, message: "Min length is 6" },
                maxLength: { value: 12, message: "Max length is 12" },
              })}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            mr={3}
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            colorScheme="blue"
          >
            {labels.submit}
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            {labels.prev /* using prev label as generic “Cancel” if needed */}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;
