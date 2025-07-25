import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiClient from "../hooks/apiClient"; // Assuming apiClient is in hooks directory
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  FormErrorMessage,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux"; // To check user role

const PotentialClientCreateForm = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const user = useSelector((state) => state.user.user); // Accessing user from Redux store (consistent with DetailView)
  const userRole = user?.role;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const createClientMutation = useMutation({
    mutationFn: (newClientData) =>
      apiClient.post("/potential-clients", newClientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["potentialClients"] });
      toast({
        title:
          currentLanguage === "fr"
            ? "Client créé avec succès."
            : currentLanguage === "ar"
            ? "تم إنشاء العميل بنجاح."
            : "Client created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      navigate("/dashboard/potential-clients");
    },
    onError: (error) => {
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur lors de la création du client."
            : currentLanguage === "ar"
            ? "خطأ في إنشاء العميل."
            : "Error creating client.",
        description:
          error.response?.data?.message ||
          error.message ||
          (currentLanguage === "fr"
            ? "Une erreur inattendue s'est produite. Veuillez réessayer."
            : currentLanguage === "ar"
            ? "حدث خطأ غير متوقع. حاول مرة أخرى."
            : "An unexpected error occurred. Please try again."),
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const onSubmit = (data) => {
    createClientMutation.mutate(data);
  };

  // Basic role check (though routing should ideally handle this)
  if (userRole !== "admin" && userRole !== "coordinator") {
    return (
      <Box p={5}>
        <Heading size="md" color="red.500">
          {currentLanguage === "fr"
            ? "Accès Refusé"
            : currentLanguage === "ar"
            ? "الوصول مرفوض"
            : "Access Denied"}
        </Heading>
        <Text>
          {currentLanguage === "fr"
            ? "Vous n'avez pas la permission de créer des clients potentiels."
            : currentLanguage === "ar"
            ? "ليس لديك إذن لإنشاء عملاء محتملين."
            : "You do not have permission to create potential clients."}
        </Text>
        <Button mt={4} onClick={() => navigate("/dashboard")}>
          {currentLanguage === "fr"
            ? "Aller au Tableau de Bord"
            : currentLanguage === "ar"
            ? "اذهب إلى لوحة التحكم"
            : "Go to Dashboard"}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={5} maxW="lg" mx="auto">
      <VStack as="form" onSubmit={handleSubmit(onSubmit)} spacing={6} w="full">
        <Heading as="h1" size="lg" textAlign="center">
          {currentLanguage === "fr"
            ? "Créer un Nouveau Client Potentiel"
            : currentLanguage === "ar"
            ? "إنشاء عميل محتمل جديد"
            : "Create New Potential Client"}
        </Heading>

        <FormControl isInvalid={errors.name}>
          <FormLabel htmlFor="name">
            {currentLanguage === "fr"
              ? "Nom Complet"
              : currentLanguage === "ar"
              ? "الاسم الكامل"
              : "Full Name"}
          </FormLabel>
          <Input
            id="name"
            placeholder={
              currentLanguage === "fr"
                ? "Entrez le nom complet"
                : currentLanguage === "ar"
                ? "أدخل الاسم الكامل"
                : "Enter full name"
            }
            {...register("name", {
              required:
                currentLanguage === "fr"
                  ? "Le nom est requis."
                  : currentLanguage === "ar"
                  ? "الاسم مطلوب."
                  : "Name is required.",
              minLength: {
                value: 2,
                message:
                  currentLanguage === "fr"
                    ? "Le nom doit comporter au moins 2 caractères."
                    : currentLanguage === "ar"
                    ? "يجب أن يتكون الاسم من حرفين على الأقل."
                    : "Name must be at least 2 characters.",
              },
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.phone}>
          <FormLabel htmlFor="phone">
            {currentLanguage === "fr"
              ? "Numéro de Téléphone"
              : currentLanguage === "ar"
              ? "رقم الهاتف"
              : "Phone Number"}
          </FormLabel>
          <Input
            id="phone"
            type="tel"
            placeholder={
              currentLanguage === "fr"
                ? "Entrez le numéro de téléphone"
                : currentLanguage === "ar"
                ? "أدخل رقم الهاتف"
                : "Enter phone number"
            }
            {...register("phone", {
              required:
                currentLanguage === "fr"
                  ? "Le numéro de téléphone est requis."
                  : currentLanguage === "ar"
                  ? "رقم الهاتف مطلوب."
                  : "Phone number is required.",
              pattern: {
                value: /^[0-9+\s()-]*$/, // Simple pattern, can be more strict
                message:
                  currentLanguage === "fr"
                    ? "Format du numéro de téléphone invalide."
                    : currentLanguage === "ar"
                    ? "تنسيق رقم الهاتف غير صالح."
                    : "Invalid phone number format.",
              },
            })}
          />
          <FormErrorMessage>
            {errors.phone && errors.phone.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.email}>
          <FormLabel htmlFor="email">
            {currentLanguage === "fr"
              ? "Adresse E-mail"
              : currentLanguage === "ar"
              ? "عنوان البريد الإلكتروني"
              : "Email Address"}
          </FormLabel>
          <Input
            id="email"
            type="email"
            placeholder={
              currentLanguage === "fr"
                ? "Entrez l'adresse e-mail"
                : currentLanguage === "ar"
                ? "أدخل عنوان البريد الإلكتروني"
                : "Enter email address"
            }
            {...register("email", {
              required:
                currentLanguage === "fr"
                  ? "L'e-mail est requis."
                  : currentLanguage === "ar"
                  ? "البريد الإلكتروني مطلوب."
                  : "Email is required.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message:
                  currentLanguage === "fr"
                    ? "Adresse e-mail invalide."
                    : currentLanguage === "ar"
                    ? "عنوان البريد الإلكتروني غير صالح."
                    : "Invalid email address.",
              },
            })}
          />
          <FormErrorMessage>
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.status}>
          <FormLabel htmlFor="status">
            {currentLanguage === "fr"
              ? "Statut"
              : currentLanguage === "ar"
              ? "الحالة"
              : "Status"}
          </FormLabel>
          <Select
            id="status"
            placeholder={
              currentLanguage === "fr"
                ? "Sélectionnez le statut"
                : currentLanguage === "ar"
                ? "اختر الحالة"
                : "Select status"
            }
            {...register("status", {
              required:
                currentLanguage === "fr"
                  ? "Le statut est requis."
                  : currentLanguage === "ar"
                  ? "الحالة مطلوبة."
                  : "Status is required.",
            })}
          >
            <option value="intéressé">
              {currentLanguage === "fr"
                ? "Intéressé"
                : currentLanguage === "ar"
                ? "مهتم"
                : "Interested"}
            </option>
            <option value="pas intéressé">
              {currentLanguage === "fr"
                ? "Pas intéressé"
                : currentLanguage === "ar"
                ? "غير مهتم"
                : "Not Interested"}
            </option>
            <option value="injoignable">
              {currentLanguage === "fr"
                ? "Injoignable"
                : currentLanguage === "ar"
                ? "لا يمكن الوصول إليه"
                : "Unreachable"}
            </option>
          </Select>
          <FormErrorMessage>
            {errors.status && errors.status.message}
          </FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={createClientMutation.isLoading || isSubmitting}
          loadingText={
            currentLanguage === "fr"
              ? "Soumission en cours"
              : currentLanguage === "ar"
              ? "جارٍ الإرسال"
              : "Submitting"
          }
          width="full"
          size="lg"
        >
          {currentLanguage === "fr"
            ? "Créer Client"
            : currentLanguage === "ar"
            ? "إنشاء عميل"
            : "Create Client"}
        </Button>

        <Button
          variant="outline"
          colorScheme="gray"
          onClick={() => navigate("/dashboard/potential-clients")}
          width="full"
          isDisabled={createClientMutation.isLoading || isSubmitting}
        >
          {currentLanguage === "fr"
            ? "Annuler"
            : currentLanguage === "ar"
            ? "إلغاء"
            : "Cancel"}
        </Button>
      </VStack>
    </Box>
  );
};

export default PotentialClientCreateForm;
