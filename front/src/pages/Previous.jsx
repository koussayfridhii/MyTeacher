import CallList from "../components/CallList";
import { withAuthorization } from "../HOC/Protect";

const PreviousPage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Previous Calls</h1>

      <CallList type="ended" />
    </section>
  );
};

export default withAuthorization(PreviousPage, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
