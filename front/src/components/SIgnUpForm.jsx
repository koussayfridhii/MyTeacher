import { useState } from "react";
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
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
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

  // Local state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      toast({
        title: "Account created.",
        description: res.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/signin");
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed.",
        description: err.response?.data?.error || "Signup failed",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
          {t.signUpTitle || "SignUp"}
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
            <FormErrorMessage>{errors["First Name"]?.message}</FormErrorMessage>
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
            <FormErrorMessage>{errors["Last Name"]?.message}</FormErrorMessage>
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
            <FormErrorMessage>{errors.Email?.message}</FormErrorMessage>
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
              {errors["Mobile number"]?.message}
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
            <FormErrorMessage>{errors.Tilte?.message}</FormErrorMessage>
          </FormControl>

          {/* Password Field with toggle */}
          <FormControl isInvalid={!!errors.Password} mb={4}>
            <FormLabel color="primary" htmlFor="password">
              {t.passwordLabel || "Password"}
            </FormLabel>
            <InputGroup>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder || "Password"}
                {...register("Password", {
                  required: t.passwordRequired || "Password is required",
                  minLength: {
                    value: 6,
                    message: t.passwordMinLength || "Minimum length is 6",
                  },
                })}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.Password?.message}</FormErrorMessage>
          </FormControl>

          {/* Confirm Password Field with toggle */}
          <FormControl isInvalid={!!errors.PasswordRepeat} mb={6}>
            <FormLabel color="primary" htmlFor="passwordRepeat">
              {t.confirmPasswordLabel || "Confirm Password"}
            </FormLabel>
            <InputGroup>
              <Input
                id="passwordRepeat"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmPasswordPlaceholder || "Confirm Password"}
                {...register("PasswordRepeat", {
                  required:
                    t.confirmPasswordRequired || "Please confirm your password",
                  validate: (value) =>
                    value === password ||
                    t.passwordsDoNotMatch ||
                    "Passwords do not match",
                })}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              {errors.PasswordRepeat?.message}
            </FormErrorMessage>
          </FormControl>

          {/* Submit and link */}
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
              <Link to="/signin">
                {t.haveAccount || "Already have an account?"}
              </Link>
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
