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
import { useSelector } from "react-redux"; // Import useSelector

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
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const bg = useColorModeValue("white", "gray.800");
  const headerColor = useColorModeValue("gray.700", "white");

  const defaultButtonText =
    currentLanguage === "fr"
      ? "Confirmer"
      : currentLanguage === "ar"
      ? "تأكيد"
      : "Confirm";

  const iconAltText =
    currentLanguage === "fr"
      ? "icône"
      : currentLanguage === "ar"
      ? "أيقونة"
      : "icon";

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent bg={bg} className={className} p={6}>
        <ModalHeader textAlign={textAlign}>
          {image && (
            <Box mb={4} display="flex" justifyContent={textAlign}>
              <Image src={image} alt={iconAltText} boxSize="72px" />
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
                <Image src={buttonIcon} alt={iconAltText} boxSize="14px" />
              ) : null
            }
          >
            {buttonText === "Confirm" ? defaultButtonText : buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MeetingModal;
