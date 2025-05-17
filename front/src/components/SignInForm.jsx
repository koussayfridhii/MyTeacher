import { useState } from "react";
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
  InputGroup,
  InputRightElement,
  Center,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
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

  // Local state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/signin",
        {
          email: data.Email,
          password: data.Password,
        }
      );
      if (res.status !== 200) {
        toast({
          title: "Sign-in failed",
          description: res.data?.message || "verify your email",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      // store token
      localStorage.setItem("token", res.data.token);

      // fetch user profile
      const profileRes = await axios.get(
        import.meta.env.VITE_API_URL + "/auth/profile",
        { headers: { Authorization: `Bearer ${res.data.token}` } }
      );
      const walletRes = await axios.get(
        import.meta.env.VITE_API_URL + "/wallet",
        { headers: { Authorization: `Bearer ${res.data.token}` } }
      );
      const userData = { user: profileRes.data.user, ...walletRes.data };

      // dispatch login to Redux
      dispatch(loginAction(userData));

      toast({
        title: `Welcome back! ${userData?.user?.firstName} ${userData?.user?.lastName}`,
        description: "Signed in successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

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
    <Flex
      flexDir={{ base: "column-reverse", lg: "row" }}
      w="100%"
      h="100vh"
      justify="center"
      align="center"
    >
      <Center bg="gray.50" display={{ base: "none", lg: "block" }}>
        <ChakraImage
          src="/assets/icons/signin.svg"
          w={{ lg: "30vw", base: "80vw" }}
        />
      </Center>
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
          {t.signInTitle || "SignIn"}
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
            <FormErrorMessage>{errors.Email?.message}</FormErrorMessage>
          </FormControl>

          {/* Password with toggle */}
          <FormControl isInvalid={!!errors.Password} mb={6}>
            <FormLabel color="primary" htmlFor="password">
              {t.password}
            </FormLabel>
            <InputGroup>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.password}
                {...register("Password", {
                  required: t.passwordRequired,
                  minLength: { value: 6, message: t.passwordMin },
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
              <Link to="/signup">
                {t.noAccount || "Don’t have an account?"}
              </Link>
            </Text>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
