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
  Select,
  Center,
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

  const handleLanguageChange = (e) => {
    dispatch(languageReducer(e.target.value));
  };

  return (
    <Box as="header" bg={bg} p={4} color={color} w="full">
      <Flex align="center" justify={{ base: "space-between" }}>
        <HStack spacing={5} align="center">
          <Menu bg={bg} color={color}>
            <MenuButton>
              <Avatar
                name={`${user?.firstName} ${user?.lastName}`}
                src={user?.profilePic || "/assets/images/avatar-1.jpeg"}
              />
            </MenuButton>
            <MenuList bg={bg} color={color}>
              <MenuItem bg={bg} fontWeight="bold">
                {`User: ${user?.firstName} ${user?.lastName}`}
              </MenuItem>
              <MenuItem bg={bg} fontWeight="bold">
                {user?.email}
              </MenuItem>
              <MenuItem bg={bg} fontWeight="bold">
                <Link to={`/profile/${user._id}`}>Profile settings</Link>
              </MenuItem>

              <Center bg={bg} fontWeight="bold" w="full" mt={2} gap={4}>
                <Select
                  size="sm"
                  value={language}
                  onChange={handleLanguageChange}
                  w="100px"
                  sx={{
                    bg: bg,
                    color: color,
                    option: {
                      bg: bg,
                      color: color,
                    },
                  }}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="fr">Français</option>
                </Select>
                {token ? (
                  <Button size="sm" colorScheme="red" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => navigate("/signin")}
                  >
                    Login
                  </Button>
                )}
              </Center>
            </MenuList>
          </Menu>

          {["student", "teacher"].includes(user?.role) && (
            <HStack spacing={1} align="center">
              <Text color="white" fontSize="xl" fontWeight="bold">
                {wallet?.balance}{" "}
              </Text>
              <ChakraImage src="/assets/icons/coin.svg" boxSize={6} />
            </HStack>
          )}

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
