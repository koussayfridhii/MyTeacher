// Navbar.js
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { languageReducer } from "../redux/languageSlice";
import {
  Flex,
  HStack,
  Button,
  useColorModeValue,
  Box,
  Image as ChakraImage,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link as ChakraLink,
} from "@chakra-ui/react";
import MobileNav from "./MobileNav";
import axios from "axios";

const Navbar = ({ home }) => {
  const token = localStorage.getItem("token");
  const { user, wallet } = useSelector((state) => state.user);
  const language = useSelector((state) => state.language.language);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bg = useColorModeValue("gray.800", "gray.900");
  const color = useColorModeValue("white", "white");
  const handleLogout = async () => {
    await axios
      .post(
        import.meta.env.VITE_API_URL + "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        dispatch(logout());
        localStorage.removeItem("token");
      });

    navigate("/signin");
  };

  const switchLang = () => {
    dispatch(languageReducer(language === "en" ? "ar" : "en"));
  };
  return (
    <Box as="header" bg={bg} p={4} color={color} w="full">
      <Flex align="center" justify={{ base: "space-between" }}>
        {/* <ChakraImage src="/assets/icons/yoom-logo.svg" boxSize={20} m={0} /> */}
        <HStack spacing={5} align="center">
          <Menu bg={bg} color={color}>
            <MenuButton>
              <Avatar
                name={`${user?.firstName} ${user?.lastName}`}
                src={"/assets/images/avatar-5.png"}
              />
            </MenuButton>
            <MenuList bg={bg} color={color}>
              <MenuItem bg={bg} fontWeight="bold">
                user :{` ${user?.firstName} ${user?.lastName}`}
              </MenuItem>
              <MenuItem bg={bg} fontWeight="bold">
                {user?.email}
              </MenuItem>
              <MenuItem bg={bg} fontWeight="bold">
                Profile Settings
              </MenuItem>
              <MenuItem bg={bg}>
                {" "}
                <HStack spacing={4}>
                  <Button size="sm" onClick={switchLang} colorScheme="blue">
                    {language.toUpperCase()}
                  </Button>
                  {token ? (
                    <>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => navigate("/signin")}
                    >
                      Login
                    </Button>
                  )}
                </HStack>
              </MenuItem>
            </MenuList>
          </Menu>
          <HStack spacing={1} align="center">
            <Text color="white" fontSize="xl" fontWeight="bold">
              {wallet?.balance}{" "}
            </Text>
            <ChakraImage src="/assets/icons/coin.svg" boxSize={6} />
          </HStack>
          {home && (
            <HStack spacing={1} align="center">
              <ChakraLink
                as={Link}
                color="white"
                fontSize="xl"
                fontWeight="bold"
              >
                Home
              </ChakraLink>
            </HStack>
          )}
        </HStack>
        <MobileNav />
      </Flex>
    </Box>
  );
};

export default Navbar;
