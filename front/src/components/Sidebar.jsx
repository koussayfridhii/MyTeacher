import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  Box,
  VStack,
  Flex,
  Link as ChakraLink,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { sidebarLinks } from "../data/sidebar";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const location = useLocation();
  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user);
  const bgColor = useColorModeValue("gray.800", "gray.900");
  const activeColor = useColorModeValue("white", "white");
  const inactiveColor = useColorModeValue("gray.200", "gray.400");
  return (
    <Box
      as="aside"
      position="sticky"
      top={0}
      left={0}
      minH={"100vh"}
      // h="fit-content"
      w={{ base: "0", lg: "fit-content" }}
      bg={bgColor}
      color="white"
      p={6}
      pt={28}
      display={{ base: "none", lg: "block" }}
    >
      <VStack align="stretch" spacing={4} h="full" justify="flex-start">
        {sidebarLinks
          .filter((element) => element?.authorizedRoles.includes(user?.role))
          .map((item) => {
            const isActive =
              location.pathname === item.route ||
              location.pathname.startsWith(`${item.route}/`);
            return (
              <ChakraLink
                as={NavLink}
                to={item.route}
                key={item.route}
                style={{ textDecoration: "none" }}
                _hover={{ textDecoration: "none" }}
              >
                <Flex
                  align="center"
                  p={4}
                  borderRadius="lg"
                  bg={isActive ? "primary" : "transparent"}
                  color={isActive ? activeColor : inactiveColor}
                >
                  <Image
                    src={item.imgURL}
                    alt={item.label}
                    boxSize="6"
                    mr={4}
                  />
                  <Text fontSize="lg" fontWeight="semibold">
                    {item.label?.[language] || item.label.en}
                  </Text>
                </Flex>
              </ChakraLink>
            );
          })}
      </VStack>
    </Box>
  );
};

export default Sidebar;
