import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const user = useSelector((state) => state.user.user);
  const language = useSelector((state) => state.language.language);
  const location = useLocation();
  const bg = useColorModeValue("white", "gray.800");
  const dir = language === "ar" ? "rtl" : "ltr";
  //TODO: check if the sidebar should be visible
  const sideBarVisible =
    (!location.pathname.includes("/signin") ||
      !location.pathname.includes("/signup") ||
      !location.pathname.includes("/meeting/") ||
      !location.pathname.replace("/meeting/", "").includes("/")) &&
    user;
  return (
    <Box
      minH="100vh"
      w={"full"}
      bg={bg}
      dir={dir}
      color={useColorModeValue("gray.800", "white")}
    >
      {user && <Navbar home={!sideBarVisible} />}
      <Flex>
        {sideBarVisible && <Sidebar />}
        <Box flex="1" p={0}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
