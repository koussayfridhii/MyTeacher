import React from "react";
import {
  Box,
  Flex,
  Text,
  Image as ChakraImage,
  useColorModeValue,
} from "@chakra-ui/react";

const HomeCard = ({
  className,
  img,
  title,
  description,
  handleClick,
  bgColor,
  role,
}) => {
  const glassBg = useColorModeValue(
    "rgba(255, 255, 255, 0.2)",
    "rgba(0, 0, 0, 0.2)"
  );
  return (
    <Box
      as="section"
      onClick={handleClick}
      cursor={handleClick ? "pointer" : "default"}
      bg={bgColor || "red.500"}
      px={4}
      py={6}
      minH="260px"
      maxW={
        role !== "student" ? { base: "100%", xl: "270px" } : { base: "full" }
      }
      w={role !== "student" ? { base: "100%", xl: "270px" } : { base: "50vw" }}
      borderRadius="14px"
      className={className}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex
        align="center"
        justify="center"
        w="48px"
        h="48px"
        borderRadius="10px"
        bg={glassBg}
        backdropFilter="auto"
        backdropBlur="10px"
        mb={4}
      >
        <ChakraImage src={img} alt={title} boxSize="27px" />
      </Flex>

      <Box mt={2}>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="lg" fontWeight="normal">
          {description}
        </Text>
      </Box>
    </Box>
  );
};

export default HomeCard;
