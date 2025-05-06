import { useForm } from "react-hook-form";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Card,
  useToast,
  Flex,
  Text,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { translations } from "../data/forms";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { login as loginAction } from "../redux/userSlice";

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/signin",
        {
          email: data.Email,
          password: data.Password,
        }
      );
      // store token
      localStorage.setItem("token", res.data.token);

      // optionally fetch user profile, assuming endpoint returns user data
      const profileRes = await axios.get(
        import.meta.env.VITE_API_URL + "/auth/profile",
        { headers: { Authorization: `Bearer ${res.data.token}` } }
      );
      const userData = profileRes.data.user;

      // dispatch login to Redux
      dispatch(loginAction(userData));

      toast({
        title:
          "Welcome back! " + userData?.firstName + " " + userData?.lastName,
        description: "Signed in successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // redirect
      navigate("/");
    } catch (err) {
      toast({
        title: "Sign-in failed",
        description: err.response?.data?.error || "Invalid credentials",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const language = useSelector((state) => state.language.language);
  const t = translations[language] || translations.en;

  return (
    <Flex>
      <ChakraImage
        src="./assets/icons/signin.svg"
        w={{ lg: "30vw", base: "80vw" }}
        display={{ lg: "block", base: "none" }}
      />
      <Card
        bg="background"
        border="2px"
        borderColor="primary"
        w={{ lg: "30vw", base: "80vw" }}
        px={6}
        py={20}
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

          {/* Password */}
          <FormControl isInvalid={!!errors.Password} mb={6}>
            <FormLabel color="primary" htmlFor="password">
              {t.password}
            </FormLabel>
            <Input
              id="password"
              type="password"
              placeholder={t.password}
              {...register("Password", {
                required: t.passwordRequired,
                minLength: { value: 6, message: t.passwordMin },
              })}
            />
            <FormErrorMessage>
              {errors.Password && errors.Password.message}
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
              <Link to="/signup">Don’t have an account?</Link>
            </Text>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
