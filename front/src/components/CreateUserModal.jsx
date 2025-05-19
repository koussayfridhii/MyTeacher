import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
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
  Select,
  Button,
  VStack,
  FormErrorMessage,
  Progress,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

/**
 * CreateUserModal
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onCreate
 * @param {object} labels
 * @param {boolean} showTeacherFields - explicitly show fields for teachers
 * @param {Array} coordinators - list of { _id, firstName, lastName } to select for assigning student
 */
const CreateUserModal = ({
  isOpen,
  onClose,
  onCreate,
  labels,
  showTeacherFields = false,
  coordinators = [],
}) => {
  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [uploadError, setUploadError] = useState(null);

  const handleClose = () => {
    reset();
    setUploadProgress(0);
    setProfilePicUrl("");
    setUploadError(null);
    onClose();
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "react_preset");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/drtmtlnwi/image/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        }
      );
      setProfilePicUrl(res.data.secure_url);
    } catch (err) {
      console.log(err);
      setUploadError(err.message);
    }
  };

  const onSubmit = async (data) => {
    if (profilePicUrl) {
      data.profilePic = profilePicUrl;
    }
    if (data.programs) {
      data.programs = data.programs
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    }
    // if admin and creating student, include coordinatorId
    if (user.role === "admin" && !showTeacherFields && data.coordinatorId) {
      data.coordinator = data.coordinatorId;
    }
    await onCreate(data);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <ModalOverlay />
      <ModalContent dir={language === "ar" ? "rtl" : "ltr"}>
        <ModalHeader textAlign="center">{labels.modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Email */}
            <FormControl isInvalid={errors.email}>
              <FormLabel>{labels.email}</FormLabel>
              <Input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={errors.password}>
              <FormLabel>{labels.password}</FormLabel>
              <Input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Min length is 6" },
                })}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            {/* First Name */}
            <FormControl isInvalid={errors.firstName}>
              <FormLabel>{labels.firstName}</FormLabel>
              <Input
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>

            {/* Last Name */}
            <FormControl isInvalid={errors.lastName}>
              <FormLabel>{labels.lastName}</FormLabel>
              <Input
                {...register("lastName", {
                  required: "Last name is required",
                })}
              />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>

            {/* Mobile Number */}
            <FormControl isInvalid={errors.mobileNumber}>
              <FormLabel>{labels.mobile}</FormLabel>
              <Input
                {...register("mobileNumber", {
                  required: "Mobile number is required",
                  minLength: { value: 6, message: "Min length is 6" },
                  maxLength: { value: 12, message: "Max length is 12" },
                })}
              />
              <FormErrorMessage>
                {errors.mobileNumber?.message}
              </FormErrorMessage>
            </FormControl>

            {/* Coordinator select for admin when creating student */}
            {user.role === "admin" && !showTeacherFields && (
              <FormControl isInvalid={errors.coordinatorId}>
                <FormLabel>{labels.coordinator || "Coordinator"}</FormLabel>
                <Select
                  placeholder={labels.coordinator || "Select coordinator"}
                  {...register("coordinatorId", {
                    required: "Coordinator is required",
                  })}
                >
                  {coordinators.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>
                  {errors.coordinatorId?.message}
                </FormErrorMessage>
              </FormControl>
            )}

            {/* Profile Picture Upload */}
            <FormControl>
              <FormLabel>Profile Picture</FormLabel>
              <Input type="file" accept="image/*" onChange={onFileChange} />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress value={uploadProgress} size="sm" mt={2} />
              )}
              {uploadError && <Text color="red.500">{uploadError}</Text>}
            </FormControl>

            {/* Teacher-only fields */}
            {showTeacherFields && (
              <>
                <FormControl isInvalid={errors.rib}>
                  <FormLabel>rib</FormLabel>
                  <Input {...register("rib")} />
                  <FormErrorMessage>{errors.rib?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.subject}>
                  <FormLabel>{labels.subject}</FormLabel>
                  <Input {...register("subject")} />
                  <FormErrorMessage>{errors.subject?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.programs}>
                  <FormLabel>{labels.program}</FormLabel>
                  <Input
                    {...register("programs")}
                    placeholder="Program1, Program2"
                  />
                  <FormErrorMessage>
                    {errors.programs?.message}
                  </FormErrorMessage>
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {labels.submit}
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            {labels.prev}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateUserModal;
