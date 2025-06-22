import React, { useState } from "react";
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
import { t } from "../utils/translations"; // Added import

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
    // Handle max_hours_per_week: if empty string or undefined, set to null
    if (user.role === "admin" && showTeacherFields) {
      if (data.max_hours_per_week === '' || data.max_hours_per_week === undefined) {
        data.max_hours_per_week = null;
      }
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
              <FormLabel>{labels.password}</FormLabel>
              <Input
                type="password"
                {...register("password", {
                  required: t(
                    "createUserModal.validation.passwordRequired",
                    language
                  ),
                  minLength: {
                    value: 6,
                    message: t(
                      "createUserModal.validation.minLength6",
                      language
                    ),
                  },
                })}
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

            {/* Coordinator select for admin when creating student */}
            {user.role === "admin" && !showTeacherFields && (
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
                  {...register("coordinatorId", {
                    required: t(
                      "createUserModal.validation.coordinatorRequired",
                      language
                    ),
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
              <FormLabel>
                {t("createUserModal.profilePictureLabel", language)}
              </FormLabel>
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
                  <FormLabel>
                    {t("createUserModal.ribLabel", language)}
                  </FormLabel>
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
                    placeholder={t(
                      "createUserModal.programPlaceholder",
                      language
                    )}
                  />
                  <FormErrorMessage>
                    {errors.programs?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Max Weekly Hours - only for Admin creating Teacher */}
                {user.role === "admin" && (
                   <FormControl isInvalid={errors.max_hours_per_week}>
                    <FormLabel>{labels.maxWeeklyHours || "Max Weekly Hours"}</FormLabel>
                    <Input
                      type="number"
                      min="0"
                      {...register("max_hours_per_week", {
                        valueAsNumber: true, // Ensure it's treated as a number
                        min: { value: 0, message: "Cannot be negative" },
                      })}
                      placeholder="e.g., 10 (leave blank for no limit)"
                    />
                    <FormErrorMessage>
                      {errors.max_hours_per_week?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
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
