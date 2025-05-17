import React, { useState } from "react";
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
  Select,
  Text,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { login as loginAction, attendClass } from "../redux/userSlice";
import { useGetUsers } from "../hooks/useGetUsers";
import axios from "axios";
import ReactSelect from "react-select";

const baseURL = import.meta.env.VITE_API_URL;
const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <Input
    ref={ref}
    value={value}
    onClick={onClick}
    focusBorderColor="blue.300"
    cursor="pointer"
  />
));
const allowedRoles = ["admin", "coordinator"];

const MeetingTypeList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const client = useStreamVideoClient();

  const token = localStorage.getItem("token");
  const user = useSelector((s) => s.user.user);

  const { data: users = [], isLoading } = useGetUsers();

  const [meetingState, setMeetingState] = useState();
  const [callDetail, setCallDetail] = useState();
  const [values, setValues] = useState({
    topic: "",
    teacherId: "",
    studentIds: [],
    dateTime: new Date(),
    link: "",
    id: "",
  });

  const myUsers = users.filter((u) => u.coordinator?._id === user._id);
  const teachers = users.filter((u) => u.role === "teacher");
  const students = myUsers.filter((u) => u.role === "student");

  const studentOptions = students.map((s) => ({
    value: s._id,
    label: `${s.firstName} ${s.lastName}`,
  }));

  const createMeeting = async () => {
    if (!client || !token) return;
    if (!values.dateTime || !values.teacherId || values.studentIds.length < 1) {
      toast({
        title: "Topic, teacher & at least 1 student required",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      toast({
        title: "You are not allowed to create meetings",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      await call.getOrCreate({
        data: {
          starts_at: values.dateTime.toISOString(),
          custom: { topic: values.topic },
        },
      });
      setCallDetail(call);
      toast({ title: "Meeting Created", status: "success", duration: 3000 });

      await axios.post(
        `${baseURL}/classes`,
        {
          meetID: call.id,
          teacher: values.teacherId,
          students: values.studentIds,
          topic: values.topic,
          date: values.dateTime.toISOString(),
          recordingUrl: values.link || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to create Meeting",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleJoinMeeting = async () => {
    if (user.role === "student") {
      try {
        const { data } = await axios.post(
          `${baseURL}/users/push-class`,
          { classId: values.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(
          attendClass({
            attendedClasses: data.attendedClasses,
            balance: data.walletBalance,
          })
        );
        navigate(`/meeting/${values.id}`);
      } catch (err) {
        console.log(err);
        if (err.response?.status === 400) {
          toast({
            title: "Not enough points",
            status: "warning",
            duration: 4000,
          });
          const [p, w] = await Promise.all([
            axios.get(`${baseURL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${baseURL}/wallet`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          dispatch(loginAction({ user: p.data.user, ...w.data }));
        } else if (err.response?.status === 403) {
          toast({
            title: "You are not enrolled in this class.",
            status: "error",
            duration: 3000,
          });
        } else {
          toast({ title: "Failed to join", status: "error", duration: 3000 });
        }
      }
    } else navigate(`/meeting/${values.link}`);
  };

  if (!client || !token || isLoading) {
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
          ? { base: "1fr", md: "repeat(2,1fr)", xl: "repeat(4,1fr)" }
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
        <HomeCard
          img="/assets/icons/join-meeting.svg"
          title="Join Meeting"
          description="Via invitation link"
          handleClick={() => setMeetingState("join")}
          bgColor="secondary"
          role="student"
        />
      )}

      {/* Schedule / Create Modal */}
      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "schedule"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <Box mb={4}>
            <Input
              placeholder="Topic"
              value={values.topic}
              onChange={(e) =>
                setValues((v) => ({ ...v, topic: e.target.value }))
              }
              focusBorderColor="blue.300"
            />
          </Box>
          <Box mb={4}>
            <Select
              placeholder="Select a teacher"
              value={values.teacherId}
              onChange={(e) =>
                setValues((v) => ({ ...v, teacherId: e.target.value }))
              }
              focusBorderColor="blue.300"
            >
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </Select>
          </Box>
          <Box mb={4}>
            <Text mb={2}>Select students (1–8)</Text>
            <ReactSelect
              isMulti
              options={studentOptions}
              value={studentOptions.filter((opt) =>
                values.studentIds.includes(opt.value)
              )}
              onChange={(selected) => {
                const ids = (selected || []).map((o) => o.value);
                if (ids.length <= 8) {
                  setValues((v) => ({ ...v, studentIds: ids }));
                }
              }}
              placeholder="Type to search…"
              closeMenuOnSelect={false}
              isClearable
              styles={{ container: (base) => ({ ...base, minWidth: "200px" }) }}
            />
            {values.studentIds.length === 0 && (
              <Text color="red.500" fontSize="sm" mt={1}>
                Please select at least one student.
              </Text>
            )}
            {values.studentIds.length > 8 && (
              <Text color="red.500" fontSize="sm" mt={1}>
                You can only select up to 8 students.
              </Text>
            )}
          </Box>
          <Box>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues((v) => ({ ...v, dateTime: date }))}
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

      {/* Join Modal */}
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
          value={values.id}
          onChange={(e) => setValues((v) => ({ ...v, id: e.target.value }))}
          focusBorderColor="blue.300"
        />
      </MeetingModal>

      {/* Instant Modal */}
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
