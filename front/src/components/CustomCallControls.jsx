import {
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  RecordCallButton,
  CancelCallButton,
  useCall,
} from "@stream-io/video-react-sdk";
import { Flex, Button, useToast } from "@chakra-ui/react";
import { useSelector } from "react-redux";

export default function CustomCallControls({ onLeave }) {
  const call = useCall();
  const user = useSelector((state) => state.user.user);
  const currentLanguage = useSelector((state) => state.language.language);
  const toast = useToast();

  if (!call) {
    throw new Error(
      currentLanguage === "fr"
        ? "useCall doit être utilisé dans un composant StreamCall."
        : currentLanguage === "ar"
        ? "يجب استخدام useCall ضمن مكون StreamCall."
        : "useCall must be used within a StreamCall component."
    );
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(call.id);
      toast({
        title:
          currentLanguage === "fr"
            ? "Lien d'invitation copié."
            : currentLanguage === "ar"
            ? "تم نسخ رابط الدعوة."
            : "Invite link copied.",
        description:
          currentLanguage === "fr"
            ? `ID de la réunion (${call.id}) copié dans le presse-papiers.`
            : currentLanguage === "ar"
            ? `معرف الاجتماع (${call.id}) تم نسخه إلى الحافظة.`
            : `Meeting ID (${call.id}) copied to clipboard.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la copie."
            : currentLanguage === "ar"
            ? "فشل النسخ."
            : "Failed to copy.",
        description:
          err?.message ||
          (currentLanguage === "fr"
            ? "Échec de la copie du lien d'invitation."
            : currentLanguage === "ar"
            ? "فشل نسخ رابط الدعوة."
            : "Failed to copy the invite link."),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex gap={4} justifyContent="center" alignItems="center" p={4} wrap="wrap">
      {user.role === "teacher" && (
        <Button onClick={copyInvite} bg="primary" color="white" rounded="full">
          {currentLanguage === "fr"
            ? "Inviter"
            : currentLanguage === "ar"
            ? "دعوة"
            : "Invite"}
        </Button>
      )}
      <ToggleAudioPublishingButton />
      <ToggleVideoPublishingButton />
      <ScreenShareButton />
      {user.role === "teacher" && <RecordCallButton />}
      <CancelCallButton onClick={onLeave} />
    </Flex>
  );
}
