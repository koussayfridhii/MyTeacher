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
  Select,
  Input,
  Button,
  VStack,
} from "@chakra-ui/react";

/**
 * ActionModal
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {object} labels
 * @param {object} modalProps { user, action }
 * @param {function} onConfirm(amount, reason)
 */
const ActionModal = ({ isOpen, onClose, labels, modalProps, onConfirm }) => {
  const { action } = modalProps;
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setReason("");
      setCustomReason("");
    }
  }, [isOpen, action]);

  const addReasons = ["bonus", "free points", "topup", "other"];
  const deductReasons = ["mistake", "unfinished session", "other"];
  const options =
    action === "add" ? addReasons : action === "deduct" ? deductReasons : [];

  const handleConfirm = () => {
    const finalReason = reason === "other" ? customReason.trim() : reason;
    onConfirm(amount, finalReason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textTransform="capitalize">
          {action === "add" && labels.add}
          {action === "deduct" && labels.deduct}
          {action === "setMin" && labels.setMin}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>
                {action === "setMin" ? labels.enterMin : labels.enterAmount}
              </FormLabel>
              <NumberInput
                min={0}
                value={amount}
                onChange={(_, val) => setAmount(val)}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            {(action === "add" || action === "deduct") && (
              <>
                <FormControl isRequired>
                  <FormLabel>{labels.reason}</FormLabel>
                  <Select
                    placeholder={labels.selectReason}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {reason === "other" && (
                  <FormControl isRequired>
                    <FormLabel>{labels.otherReason}</FormLabel>
                    <Input
                      placeholder={labels.otherReasonPlaceholder}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  </FormControl>
                )}
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {labels.cancel}
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleConfirm}
            isDisabled={
              (amount <= 0 && action !== "setMin") ||
              ((action === "add" || action === "deduct") && !reason) ||
              (reason === "other" && !customReason.trim())
            }
          >
            {labels.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ActionModal;
