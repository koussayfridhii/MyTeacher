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
import { t } from "../utils/translations";

/**
 * EditStudentModal
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSave
 * @param {object} labels
 * @param {object} student - The student data to edit.
 * @param {Array} coordinators - list of { _id, firstName, lastName } to select for assigning student
 */
const EditStudentModal = ({
  isOpen,
  onClose,
  onSave,
  labels,
  student,
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

  useEffect(() => {
    if (student) {
      setValue("email", student.email);
      setValue("firstName", student.firstName);
      setValue("lastName", student.lastName);
      setValue("mobileNumber", student.mobileNumber);
      // Admin can edit more fields
      if (user.role === 'admin') {
        setValue("coordinatorId", student.coordinator?._id);
      }
    }
  }, [student, setValue, user.role]);

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
    // Only include password if it's been entered
    if (!data.password) {
      delete data.password;
    }

    // if admin and creating student, include coordinatorId
    if (user.role === "admin" && data.coordinatorId) {
      data.coordinator = data.coordinatorId;
    }
    await onSave(data);
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
        <ModalHeader textAlign="center">{labels.editStudent || "Edit Student"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Email */}
            <FormControl isInvalid={errors.email}>
              <FormLabel>{labels.email}</FormLabel>
              <Input
                type="email"
                {...register("email", {
                  required: t(
                    "createUserModal.validation.emailRequired",
                    language
                  ),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t(
                      "createUserModal.validation.emailInvalid",
                      language
                    ),
                  },
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={errors.password}>
              <FormLabel>{labels.password} (Optional)</FormLabel>
              <Input
                type="password"
                {...register("password", {
                  minLength: {
                    value: 6,
                    message: t(
                      "createUserModal.validation.minLength6",
                      language
                    ),
                  },
                })}
                placeholder="Leave blank to keep current password"
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            {/* First Name */}
            <FormControl isInvalid={errors.firstName}>
              <FormLabel>{labels.firstName}</FormLabel>
              <Input
                {...register("firstName", {
                  required: t(
                    "createUserModal.validation.firstNameRequired",
                    language
                  ),
                })}
              />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>

            {/* Last Name */}
            <FormControl isInvalid={errors.lastName}>
              <FormLabel>{labels.lastName}</FormLabel>
              <Input
                {...register("lastName", {
                  required: t(
                    "createUserModal.validation.lastNameRequired",
                    language
                  ),
                })}
              />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>

            {/* Mobile Number */}
            <FormControl isInvalid={errors.mobileNumber}>
              <FormLabel>{labels.mobile}</FormLabel>
              <Input
                {...register("mobileNumber", {
                  required: t(
                    "createUserModal.validation.mobileRequired",
                    language
                  ),
                  minLength: {
                    value: 6,
                    message: t(
                      "createUserModal.validation.minLength6",
                      language
                    ),
                  },
                  maxLength: {
                    value: 12,
                    message: t(
                      "createUserModal.validation.mobileMaxLength12",
                      language
                    ),
                  },
                })}
              />
              <FormErrorMessage>
                {errors.mobileNumber?.message}
              </FormErrorMessage>
            </FormControl>

            {/* Coordinator select for admin when editing student */}
            {/* TODO: Hide fields for coordinator role if needed */}
            {user.role === "admin" && (
              <FormControl isInvalid={errors.coordinatorId}>
                <FormLabel>
                  {labels.coordinator ||
                    t("createUserModal.labelCoordinatorFallback", language)}
                </FormLabel>
                <Select
                  placeholder={
                    labels.coordinator ||
                    t(
                      "createUserModal.placeholderCoordinatorFallback",
                      language
                    )
                  }
                  {...register("coordinatorId")}
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
              <FormLabel>
                {t("createUserModal.profilePictureLabel", language)} (Optional)
              </FormLabel>
              <Input type="file" accept="image/*" onChange={onFileChange} />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Progress value={uploadProgress} size="sm" mt={2} />
              )}
              {uploadError && <Text color="red.500">{uploadError}</Text>}
            </FormControl>

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

export default EditStudentModal;
