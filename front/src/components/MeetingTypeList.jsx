import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import HomeCard from "./HomeCard";
import MeetingModal from "./MeetingModal";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Grid,
  Box,
  Input,
  Textarea,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

// Custom input for ReactDatePicker using Chakra UI Input
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <Input
    ref={ref}
    value={value}
    onClick={onClick}
    focusBorderColor="blue.300"
    cursor="pointer"
  />
));

const MeetingTypeList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [meetingState, setMeetingState] = useState();
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState();
  const client = useStreamVideoClient();
  const toast = useToast();

  const createMeeting = async () => {
    if (!client || !token) return;
    if (!values.dateTime) {
      toast({
        title: "Please select a date and time",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");

      await call.getOrCreate({
        data: {
          starts_at: values.dateTime.toISOString(),
          custom: { description: values.description || "Instant Meeting" },
        },
      });
      setCallDetail(call);
      toast({ title: "Meeting Created", status: "success", duration: 3000 });
      if (!values.description) {
        navigate(`/meeting/${call.id}`);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create Meeting",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (!client || !token) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const meetingLink = `http://localhost:3000/meeting/${callDetail?.id}`;

  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "repeat(2,1fr)",
        xl: "repeat(4,1fr)",
      }}
      gap={20}
      my={5}
    >
      <HomeCard
        img="./assets/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("instant")}
        bgColor="primary"
      />
      <HomeCard
        img="./assets/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via invitation link"
        handleClick={() => setMeetingState("join")}
        bgColor="secondary"
      />
      <HomeCard
        img="./assets/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        handleClick={() => setMeetingState("schedule")}
        bgColor="pink.500"
      />
      <HomeCard
        img="./assets/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        handleClick={() => navigate("/recordings")}
        bgColor="green.500"
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "schedule"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <Box mb={4}>
            <Textarea
              placeholder="Add a description"
              value={values.description}
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
              focusBorderColor="blue.300"
            />
          </Box>
          <Box>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="MMMM d, yyyy h:mm aa"
              customInput={<CustomDateInput />}
            />
          </Box>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "schedule"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link Copied", status: "success", duration: 3000 });
          }}
          image="./assets/icons/checked.svg"
          buttonIcon="./assets/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === "join"}
        onClose={() => setMeetingState(undefined)}
        title="Enter the link"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => navigate(values.link)}
      >
        <Input
          placeholder="Meeting link"
          value={values.link}
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          focusBorderColor="blue.300"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === "instant"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </Grid>
  );
};

export default MeetingTypeList;
