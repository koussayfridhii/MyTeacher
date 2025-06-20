import { Text } from "@chakra-ui/react";
import RecordingsList from "../components/RecordingsList";
import { withAuthorization } from "../HOC/Protect";
import { useSelector } from "react-redux"; // Import useSelector

const PreviousPage = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <Text fontSize="3xl" fontWeight="bold" color="gray.800">
        {currentLanguage === "fr"
          ? "Enregistrements"
          : currentLanguage === "ar"
          ? "التسجيلات"
          : "Recordings"}
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
