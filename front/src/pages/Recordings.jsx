import { Text } from "@chakra-ui/react";
import RecordingsList from "../components/RecordingsList";
import { withAuthorization } from "../HOC/Protect";

const PreviousPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <Text fontSize="3xl" fontWeight="bold" color="gray.800">
        Reordings
      </Text>

      <RecordingsList type="recordings" />
    </section>
  );
};

export default withAuthorization(PreviousPage, [
  "admin",
  "coordinator",
  // "teacher",
]);
