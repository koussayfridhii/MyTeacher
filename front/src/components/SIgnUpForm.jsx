import { useForm } from "react-hook-form";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Select,
  Card,
  useToast,
  Flex,
  Text,
  Image as ChakraImage,
  Center,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { translations } from "../data/forms";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const toast = useToast();
  // watch password for repeat validation
  const password = watch("Password", "");

  const onSubmit = async (data) => {
    try {
      // Remove PasswordRepeat from submission
      const { PasswordRepeat, ...payload } = data;
      // POST to your signup controller
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/signup",
        payload
      );
      //   alert(res.data.message);
      toast({
        title: "Account created.",
        description: res.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Redirect or reset form as needed
      navigate("/signin");
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed.",
        description: err.response.data.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      //   alert(err.response?.data?.message || "Signup failed");
    }
  };

  const language = useSelector((state) => state.language.language);
  const t = translations[language] || translations.en;

  return (
    <Flex
      flexDir={{ base: "column-reverse", lg: "row" }}
      w="100%"
      h="100vh"
      justify="center"
      align="center"
    >
      <Card
        bg="background"
        border="2px"
        borderColor="primary"
        w={{ lg: "30vw", base: "80vw" }}
        px={6}
        py={17}
        display="flex"
        flexDirection="column"
        justify="center"
      >
        <Text
          fontSize="4xl"
          color="primary"
          textAlign="center"
          fontWeight="bold"
          mb={8}
        >
          Signin
        </Text>
        <form
          onSubmit={handleSubmit(onSubmit)}
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          {/* First Name */}
          <FormControl isInvalid={!!errors["First Name"]} mb={4}>
            <FormLabel color="primary" htmlFor="firstName">
              {t.firstName}
            </FormLabel>
            <Input
              id="firstName"
              placeholder={t.firstName}
              {...register("First Name", {
                required: t.firstNameRequired,
                maxLength: { value: 100, message: t.firstNameMax },
              })}
            />
            <FormErrorMessage>
              {errors["First Name"] && errors["First Name"].message}
            </FormErrorMessage>
          </FormControl>

          {/* Last Name */}
          <FormControl isInvalid={!!errors["Last Name"]} mb={4}>
            <FormLabel color="primary" htmlFor="lastName">
              {t.lastName}
            </FormLabel>
            <Input
              id="lastName"
              placeholder={t.lastName}
              {...register("Last Name", {
                required: t.lastNameRequired,
                maxLength: { value: 100, message: t.lastNameMax },
              })}
            />
            <FormErrorMessage>
              {errors["Last Name"] && errors["Last Name"].message}
            </FormErrorMessage>
          </FormControl>

          {/* Email */}
          <FormControl isInvalid={!!errors.Email} mb={4}>
            <FormLabel color="primary" htmlFor="email">
              {t.email}
            </FormLabel>
            <Input
              id="email"
              type="email"
              placeholder={t.email}
              {...register("Email", {
                required: t.emailRequired,
                pattern: { value: /^\S+@\S+$/i, message: t.emailInvalid },
              })}
            />
            <FormErrorMessage>
              {errors.Email && errors.Email.message}
            </FormErrorMessage>
          </FormControl>

          {/* Mobile */}
          <FormControl isInvalid={!!errors["Mobile number"]} mb={4}>
            <FormLabel color="primary" htmlFor="mobile">
              {t.mobile}
            </FormLabel>
            <Input
              dir={language === "ar" ? "rtl" : "ltr"}
              id="mobile"
              type="tel"
              placeholder={t.mobile}
              {...register("Mobile number", {
                required: t.mobileRequired,
                minLength: { value: 6, message: t.mobileMin },
                maxLength: { value: 12, message: t.mobileMax },
              })}
            />
            <FormErrorMessage>
              {errors["Mobile number"] && errors["Mobile number"].message}
            </FormErrorMessage>
          </FormControl>

          {/* Title */}
          <FormControl isInvalid={!!errors.Tilte} mb={6}>
            <FormLabel color="primary" htmlFor="tilte">
              {t.title}
            </FormLabel>
            <Select
              id="tilte"
              placeholder={t.titlePlaceholder}
              {...register("Tilte", { required: t.titleRequired })}
              p={3}
            >
              <option value="Parent">{t.optionParent}</option>
              <option value="Student">{t.optionStudent}</option>
            </Select>
            <FormErrorMessage>
              {errors.Tilte && errors.Tilte.message}
            </FormErrorMessage>
          </FormControl>

          {/* Password */}
          <FormControl isInvalid={!!errors.Password} mb={4}>
            <FormLabel color="primary" htmlFor="password">
              Password
            </FormLabel>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...register("Password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum length is 6" },
              })}
            />
            <FormErrorMessage>
              {errors.Password && errors.Password.message}
            </FormErrorMessage>
          </FormControl>

          {/* Confirm Password */}
          <FormControl isInvalid={!!errors.PasswordRepeat} mb={6}>
            <FormLabel color="primary" htmlFor="passwordRepeat">
              Confirm Password
            </FormLabel>
            <Input
              id="passwordRepeat"
              type="password"
              placeholder="Confirm Password"
              {...register("PasswordRepeat", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            <FormErrorMessage>
              {errors.PasswordRepeat && errors.PasswordRepeat.message}
            </FormErrorMessage>
          </FormControl>

          <Flex w="100%" justify="center" align="center" gap={3}>
            <Button
              mt={4}
              bg="primary"
              color="white"
              isLoading={isSubmitting}
              type="submit"
            >
              {t.submit}
            </Button>
            <Text fontSize="xs" mt={3} color="primary">
              <Link to="/signin">Already have an account ?</Link>
            </Text>
          </Flex>
        </form>
      </Card>
      <Center bg="gray.50" display={{ base: "none", lg: "block" }}>
        <ChakraImage
          src="/assets/icons/signup.svg"
          w={{ lg: "30vw", base: "80vw" }}
        />
      </Center>
    </Flex>
  );
}
