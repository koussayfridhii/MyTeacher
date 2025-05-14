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
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login as loginAction, attendClass } from "../redux/userSlice";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};
const baseURL = import.meta.env.VITE_API_URL;
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
const allowedRoles = ["admin", "teacher", "coordinator"];

const MeetingTypeList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const wallet = useSelector((state) => state.user.wallet);
  const user = useSelector((state) => state.user.user);
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
      if (!allowedRoles.includes(user.role)) {
        toast({
          title:
            "Failed to create Meeting , you are not allowed to create a meeting",
          status: "error",
          duration: 3000,
        });
        return;
      }
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
      await axios
        .post(
          `${baseURL}/classes`,
          {
            meetID: call.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          console.log(res);
        });
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
  const handleJoinMeeting = async () => {
    if (!client || !token) return;

    if (wallet?.balance - 10 < wallet?.minimum) {
      toast({
        title: "Insufficient balance",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      // 1) hit the purchase-and-enroll endpoint
      const { data } = await axios.post(
        `${baseURL}/users/push-class`, // <-- your purchase endpoint
        { classId: values.link }, // pass the meetID
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 2) unpack
      const { attendedClasses, walletBalance } = data;
      console.log("Joined class; server replied:", data);

      // 3) update Redux
      dispatch(
        attendClass({
          attendedClasses,
          balance: walletBalance,
        })
      );

      // 4) navigate into the meeting
      navigate(`/meeting/${values.link}`);
    } catch (err) {
      // 5) if it’s a 400-insufficient-funds from the server...
      if (
        err.response?.status === 400 &&
        err.response.data.error?.toLowerCase().includes("insufficient")
      ) {
        toast({
          title: "Not enough points in your wallet.",
          description: "Please top up before joining this meeting.",
          status: "warning",
          duration: 4000,
        });
        const profileRes = await axios.get(
          import.meta.env.VITE_API_URL + "/auth/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const walletRes = await axios.get(
          import.meta.env.VITE_API_URL + "/wallet",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userData = { user: profileRes.data.user, ...walletRes.data };

        // dispatch login to Redux
        dispatch(loginAction(userData));
      } else {
        // 6) generic failure
        console.error("Failed to buy & join class:", err);
        toast({
          title: "Failed to join Meeting",
          description: err.response?.data?.error || err.message,
          status: "error",
          duration: 3000,
        });
      }
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
      templateColumns={
        user.role !== "student"
          ? {
              base: "1fr",
              md: "repeat(2,1fr)",
              xl: "repeat(4,1fr)",
            }
          : { base: "1fr" }
      }
      gap={20}
      my={5}
    >
      {user.role !== "student" ? (
        <>
          <HomeCard
            role="other"
            img="/assets/icons/add-meeting.svg"
            title="New Meeting"
            description="Start an instant meeting"
            handleClick={() => setMeetingState("instant")}
            bgColor="primary"
          />
          <HomeCard
            role="other"
            img="/assets/icons/join-meeting.svg"
            title="Join Meeting"
            description="Via invitation link"
            handleClick={() => setMeetingState("join")}
            bgColor="secondary"
          />
          <HomeCard
            role="other"
            img="/assets/icons/schedule.svg"
            title="Schedule Meeting"
            description="Plan your meeting"
            handleClick={() => setMeetingState("schedule")}
            bgColor="pink.500"
          />
          <HomeCard
            role="other"
            img="/assets/icons/recordings.svg"
            title="View Recordings"
            description="Meeting Recordings"
            handleClick={() => navigate("/meeting/recordings")}
            bgColor="green.500"
          />
        </>
      ) : (
        <>
          <HomeCard
            img="/assets/icons/join-meeting.svg"
            title="Join Meeting"
            description="Via invitation link"
            handleClick={() => setMeetingState("join")}
            bgColor="secondary"
            role="student"
          />
        </>
      )}

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
          image="/assets/icons/checked.svg"
          buttonIcon="/assets/icons/copy.svg"
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
        handleClick={handleJoinMeeting}
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
