import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Button,
} from "@chakra-ui/react";

const ActionModal = ({ isOpen, onClose, labels, modalProps, onConfirm }) => {
  const [inputValue, setInputValue] = useState(0);

  useEffect(() => {
    if (isOpen) setInputValue(0);
  }, [isOpen, modalProps]);

  const { action } = modalProps;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {action === "add" && labels.add}
          {action === "deduct" && labels.deduct}
          {action === "setMin" && labels.setMin}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>
              {action === "setMin" ? labels.enterMin : labels.enterAmount}
            </FormLabel>
            <NumberInput
              min={0}
              value={inputValue}
              onChange={(_, val) => setInputValue(val)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {labels.cancel}
          </Button>
          <Button colorScheme="blue" onClick={() => onConfirm(inputValue)}>
            {labels.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ActionModal;
