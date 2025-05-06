import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Box,
  VStack,
  Flex,
  Text,
  useDisclosure,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { sidebarLinks } from "../data/sidebar";
import { useSelector } from "react-redux";

const MobileNav = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const language = useSelector((state) => state.language.language);
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <Box display={{ base: "block", md: "none" }} dir={dir}>
      <IconButton
        icon={
          <ChakraImage src="./assets/icons/hamburger.svg" alt="menu icon" />
        }
        aria-label="Open menu"
        variant="ghost"
        onClick={onOpen}
        size="lg"
      />
      <Drawer
        placement={language === "ar" ? "right" : "left"}
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerOverlay />
        <DrawerContent bg="background">
          <DrawerCloseButton />
          <DrawerBody p={4} dir={dir}>
            <Box mb={6} display="flex" alignItems="center">
              <ChakraImage
                src="./assets/icons/logo.svg"
                alt="yoom logo"
                boxSize="8"
              />
              <Text ml={2} fontSize="2xl" fontWeight="extrabold">
                My Teacher
              </Text>
            </Box>
            <VStack align="stretch" spacing={4}>
              {sidebarLinks.map((item) => {
                const isActive = location.pathname === item.route;
                return (
                  <NavLink
                    to={item.route}
                    key={item.route}
                    style={{ textDecoration: "none" }}
                    onClick={onClose}
                    dir={dir}
                  >
                    <Flex
                      align="center"
                      p={3}
                      borderRadius="md"
                      bg={isActive ? "primary" : "transparent"}
                      color={isActive ? "white" : "text"}
                      dir={dir}
                      gap={2}
                    >
                      <ChakraImage
                        src={item.imgURL}
                        alt={item.label}
                        boxSize="5"
                        mr={4}
                      />
                      <Text fontWeight="semibold">{item.label}</Text>
                    </Flex>
                  </NavLink>
                );
              })}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default MobileNav;
