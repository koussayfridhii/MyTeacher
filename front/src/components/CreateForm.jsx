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
        title: "Client created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      navigate("/dashboard/potential-clients");
    },
    onError: (error) => {
      toast({
        title: "Error creating client.",
        description:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
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
          Access Denied
        </Heading>
        <Text>You do not have permission to create potential clients.</Text>
        <Button mt={4} onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box p={5} maxW="lg" mx="auto">
      <VStack as="form" onSubmit={handleSubmit(onSubmit)} spacing={6} w="full">
        <Heading as="h1" size="lg" textAlign="center">
          Create New Potential Client
        </Heading>

        <FormControl isInvalid={errors.name}>
          <FormLabel htmlFor="name">Full Name</FormLabel>
          <Input
            id="name"
            placeholder="Enter full name"
            {...register("name", {
              required: "Name is required.",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters.",
              },
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.phone}>
          <FormLabel htmlFor="phone">Phone Number</FormLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            {...register("phone", {
              required: "Phone number is required.",
              pattern: {
                value: /^[0-9+\s()-]*$/, // Simple pattern, can be more strict
                message: "Invalid phone number format.",
              },
            })}
          />
          <FormErrorMessage>
            {errors.phone && errors.phone.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.email}>
          <FormLabel htmlFor="email">Email Address</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address.",
              },
            })}
          />
          <FormErrorMessage>
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.status}>
          <FormLabel htmlFor="status">Status</FormLabel>
          <Select
            id="status"
            placeholder="Select status"
            {...register("status", { required: "Status is required." })}
          >
            <option value="intéressé">Intéressé</option>
            <option value="pas intéressé">Pas intéressé</option>
            <option value="injoignable">Injoignable</option>
          </Select>
          <FormErrorMessage>
            {errors.status && errors.status.message}
          </FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={createClientMutation.isLoading || isSubmitting}
          loadingText="Submitting"
          width="full"
          size="lg"
        >
          Create Client
        </Button>

        <Button
          variant="outline"
          colorScheme="gray"
          onClick={() => navigate("/dashboard/potential-clients")}
          width="full"
          isDisabled={createClientMutation.isLoading || isSubmitting}
        >
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default PotentialClientCreateForm;
