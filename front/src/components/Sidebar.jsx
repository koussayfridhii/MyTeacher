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

const Sidebar = () => {
  const location = useLocation();
  const bgColor = useColorModeValue("gray.800", "gray.900");
  const activeColor = useColorModeValue("white", "white");
  const inactiveColor = useColorModeValue("gray.200", "gray.400");

  return (
    <Box
      as="aside"
      position="sticky"
      top={0}
      left={0}
      h="100vh"
      w={{ base: "0", lg: "64" }}
      bg={bgColor}
      color="white"
      p={6}
      pt={28}
      display={{ base: "none", lg: "block" }}
    >
      <VStack align="stretch" spacing={4} h="full" justify="flex-start">
        {sidebarLinks.map((item) => {
          const isActive =
            location.pathname === item.route ||
            location.pathname.startsWith(`${item.route}/`);

          return (
            <ChakraLink
              as={NavLink}
              to={item.route}
              key={item.label}
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
                <Image src={item.imgURL} alt={item.label} boxSize="6" mr={4} />
                <Text fontSize="lg" fontWeight="semibold">
                  {item.label}
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
