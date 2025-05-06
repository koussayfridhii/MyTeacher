import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const user = useSelector((state) => state.user.user);
  const language = useSelector((state) => state.language.language);
  const bg = useColorModeValue("white", "gray.800");
  const dir = language === "ar" ? "rtl" : "ltr";
  return (
    <Box
      minH="100vh"
      w={"full"}
      bg={bg}
      dir={dir}
      color={useColorModeValue("gray.800", "white")}
    >
      {user && <Navbar />}
      <Flex>
        {user && <Sidebar />}
        <Box flex="1" p={0}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
