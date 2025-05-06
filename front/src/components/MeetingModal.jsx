import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText = "Confirm",
  image,
  buttonIcon,
  textAlign = "left",
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerColor = useColorModeValue("gray.700", "white");

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent bg={bg} className={className} p={6}>
        <ModalHeader textAlign={textAlign}>
          {image && (
            <Box mb={4} display="flex" justifyContent={textAlign}>
              <Image src={image} alt="icon" boxSize="72px" />
            </Box>
          )}
          <Text fontSize="2xl" fontWeight="bold" color={headerColor}>
            {title}
          </Text>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter justifyContent={textAlign}>
          <Button
            bg="primary"
            color="white"
            _hover={{ bg: "primaryHover" }}
            onClick={handleClick}
            leftIcon={
              buttonIcon ? (
                <Image src={buttonIcon} alt="icon" boxSize="14px" />
              ) : null
            }
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MeetingModal;
