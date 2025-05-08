import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

export function useIsMeetingOwner() {
  const call = useCall();
  if (!call) {
    throw new Error("useCall must be used within a StreamCall component.");
  }

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  return (
    !!localParticipant &&
    !!call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id
  );
}
