// ActionModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
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

const ActionModal = ({ isOpen, onClose, labels, modalProps, onConfirm }) => {
  const { action, user } = modalProps;
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setReason("");
      setCustomReason("");
      setSelectedSession("");
    }
  }, [isOpen, action]);

  const studentAddReasons = [
    "bonus",
    "free points",
    "topup",
    "unfinished session",
    "other",
  ];
  const studentDeductReasons = ["mistake", "refund", "other"];
  const teacherAddReasons = ["bonus", "approved class", "other"];
  const teacherDeductReasons = ["mistake", "cash_out", "other"];

  const isStudent = user?.role === "student";

  const options =
    action === "add"
      ? isStudent
        ? studentAddReasons
        : teacherAddReasons
      : action === "deduct"
      ? isStudent
        ? studentDeductReasons
        : teacherDeductReasons
      : [];

  const sessions = user?.attendedClasses || [];

  const handleReasonChange = (e) => {
    const val = e.target.value;
    setReason(val);
    setCustomReason("");

    if (val === "unfinished session" && sessions.length > 0) {
      const firstId = sessions[0]._id;
      setSelectedSession(firstId);
      setAmount(sessions[0].cost || 0);
    } else {
      setSelectedSession("");
      setAmount(0);
    }
  };

  useEffect(() => {
    if (reason === "unfinished session" && selectedSession) {
      const session = sessions.find(
        (s) => String(s._id) === String(selectedSession)
      );
      if (session?.cost != null) setAmount(session.cost);
    }
  }, [selectedSession, sessions, reason]);

  const handleConfirm = async () => {
    const finalReason = reason === "other" ? customReason.trim() : reason;
    const sessionId = reason === "unfinished session" ? selectedSession : null;

    if (sessionId) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/delete-class`,
          { userId: user._id, class: sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Failed to delete class:", error);
      }
    }

    onConfirm(amount, finalReason, sessionId);
    onClose();
  };

  const isConfirmDisabled =
    (amount <= 0 && action !== "setMin") ||
    ((action === "add" || action === "deduct") && !reason) ||
    (reason === "other" && !customReason.trim()) ||
    (reason === "unfinished session" && !selectedSession);

  const formatSessionLabel = (session) => {
    const date = new Date(session.date).toLocaleDateString();
    return [session.topic, session.teacher, date].filter(Boolean).join(" — ");
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
                isReadOnly={reason === "unfinished session"}
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
                    onChange={handleReasonChange}
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {reason === "unfinished session" && (
                  <FormControl isRequired>
                    <FormLabel>{labels.selectSession}</FormLabel>
                    <Select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                    >
                      {sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {formatSessionLabel(session)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

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
            isDisabled={isConfirmDisabled}
          >
            {labels.confirm}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ActionModal;
