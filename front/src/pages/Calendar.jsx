import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import axios from "axios";
import {
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  useDisclosure,
  useToast,
  Center,
  Box,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import useFetchCourses from "../hooks/useFetchCourses";
import useFetchAvailabilities from "../hooks/useFetchAvailabilities";
import { useGetUsers } from "../hooks/useGetUsers";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import MeetingModal from "../components/MeetingModal";
import ReactSelect from "react-select";

const CalendarPage = () => {
  const calendarRef = useRef(null);
  const toast = useToast();
  const client = useStreamVideoClient();
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.user.user);
  const isAdminOrCoord = user.role === "admin" || user.role === "coordinator";
  // fetch events data
  const { courses: upcomingCourses } = useFetchCourses("upcoming");
  const { courses: endedCourses } = useFetchCourses("ended");
  const { availabilities } = useFetchAvailabilities();
  const { data: users = [] } = useGetUsers({ enabled: isAdminOrCoord });

  const [events, setEvents] = useState([]);
  const [selectInfo, setSelectInfo] = useState(null);

  // Availability modal
  const {
    isOpen: availOpen,
    onOpen: openAvail,
    onClose: closeAvail,
  } = useDisclosure();
  const [newEvent, setNewEvent] = useState({ start: "", end: "" });
  const [availRole, setAvailRole] = useState("student");
  const availOptions = users.filter((u) => u.role === availRole);
  const [selectedAvailUser, setSelectedAvailUser] = useState(
    availOptions[0]?._id || ""
  );
  useEffect(() => {
    setSelectedAvailUser(availOptions[0]?._id || "");
  }, [availRole, users]);

  // Meeting scheduling
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [callDetail, setCallDetail] = useState(null);
  const [meetingValues, setMeetingValues] = useState({
    topic: "",
    teacherId: "",
    studentIds: [],
    dateTime: new Date(),
  });

  // delete availability
  const {
    isOpen: delOpen,
    onOpen: openDel,
    onClose: closeDel,
  } = useDisclosure();
  const cancelRef = useRef();
  const [delEvent, setDelEvent] = useState(null);

  // choose type
  const {
    isOpen: typeOpen,
    onOpen: openType,
    onClose: closeType,
  } = useDisclosure();

  // meeting user lists

  const teachers = users.filter((u) => u.role === "teacher");
  const studentOptions = users
    .filter((u) => u.role === "student")
    .map((s) => ({
      value: s._id,
      label: `${s.firstName} ${s.lastName}`,
    }));

  // assemble events
  useEffect(() => {
    const evs = [];
    upcomingCourses?.forEach((c) =>
      evs.push({
        id: c._id,
        title: c.topic,
        start: dayjs(c.date).toISOString(),
        end: dayjs(c.date).add(2, "hour").toISOString(),
        backgroundColor: "#FFD63A",
        borderColor: "#FFD63A",
      })
    );
    endedCourses?.forEach((c) =>
      evs.push({
        id: c._id,
        title: `${c.topic} (Ended)`,
        start: dayjs(c.date).toISOString(),
        end: dayjs(c.date).add(2, "hour").toISOString(),
        backgroundColor: "#CF0F47",
        borderColor: "#CF0F47",
      })
    );
    availabilities?.data?.forEach((a) => {
      const own = a.user?._id === user._id;
      const color = isAdminOrCoord
        ? a.user.role === "student"
          ? "#7AE2CF"
          : "#ACC572"
        : own
        ? "#7AE2CF"
        : "#7AE2CF";
      const title = isAdminOrCoord
        ? `${a.user.role}: ${a.user.firstName} ${a.user.lastName}`
        : a.title || "Availability";
      evs.push({
        id: a._id,
        title,
        start: dayjs(a.start).toISOString(),
        end: dayjs(a.end).toISOString(),
        backgroundColor: color,
        borderColor: color,
      });
    });
    setEvents(evs);
  }, [upcomingCourses, endedCourses, availabilities]);

  // on calendar select
  const handleSelect = (info) => {
    setSelectInfo(info);
    if (isAdminOrCoord) openType();
    else {
      setNewEvent({ start: info.startStr, end: info.endStr });
      openAvail();
      info.view.calendar.unselect();
    }
  };

  // confirm type
  const chooseType = (type) => {
    closeType();
    const info = selectInfo;
    if (type === "meeting") {
      setMeetingValues((v) => ({ ...v, dateTime: info.start }));
      setMeetingOpen(true);
    } else {
      setNewEvent({ start: info.startStr, end: info.endStr });
      openAvail();
    }
    info.view.calendar.unselect();
  };

  // create availability
  const createAvail = async () => {
    const payload = {
      start: newEvent.start,
      end: newEvent.end,
      user: isAdminOrCoord ? selectedAvailUser : user._id,
    };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/availability`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((e) => [
        ...e,
        {
          id: res.data.data._id,
          title: isAdminOrCoord
            ? `${res.data.data.user.role}: ${res.data.data.user.firstName} ${res.data.data.user.lastName}`
            : res.data.data.title || "Availability",
          start: payload.start,
          end: payload.end,
          backgroundColor: "#7AE2CF",
          borderColor: "#7AE2CF",
        },
      ]);
      toast({ title: "Availability created", status: "success" });
    } catch {
      toast({ title: "Failed", status: "error" });
    } finally {
      closeAvail();
    }
  };

  // create meeting
  const createMeeting = async () => {
    if (
      !meetingValues.topic ||
      !meetingValues.teacherId ||
      meetingValues.studentIds.length < 1
    ) {
      toast({ title: "Fill all fields", status: "warning" });
      return;
    }
    if (!client || !token) {
      console.log("no client or token");
      return;
    }
    try {
      const id = crypto.randomUUID();
      const call = client?.call("default", id);
      await call?.getOrCreate({
        data: {
          starts_at: meetingValues.dateTime.toISOString(),
          custom: { topic: meetingValues.topic },
        },
      });
      setCallDetail(call);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/classes`,
        {
          meetID: call?.id,
          teacher: meetingValues.teacherId,
          students: meetingValues.studentIds,
          topic: meetingValues.topic,
          date: meetingValues.dateTime.toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((e) => [
        ...e,
        {
          id,
          title: meetingValues.topic,
          start: meetingValues.dateTime.toISOString(),
          end: dayjs(meetingValues.dateTime).add(2, "hour").toISOString(),
          backgroundColor: "#FFD63A",
          borderColor: "#FFD63A",
        },
      ]);
      toast({ title: "Meeting scheduled", status: "success" });
    } catch (err) {
      console.log(err);
      toast({ title: "Error", status: "error" });
    } finally {
      setMeetingOpen(false);
    }
  };

  // delete availability click
  const handleEventClick = (info) => {
    if (
      ["coordinator", "student", "teacher"].includes(user.role) &&
      info.event.title === "Availability"
    ) {
      setDelEvent({
        id: info.event.id,
        title: info.event.title,
        bg: info.event.backgroundColor,
      });
      openDel();
    } else if (["admin"].includes(user.role)) {
      setDelEvent({
        id: info.event.id,
        title: info.event.title,
        bg: info.event.backgroundColor,
      });
      openDel();
    } else if (user.role === "coordinator") {
      const endPlusDay = dayjs(info.event._instance.range.end).add(24, "hour");
      const now = dayjs();

      // Compare now with end + 24h
      if (now.isAfter(endPlusDay)) {
        toast({
          title: info.event.title,
          description: `${info.event?._instance?.range?.start} to ${info.event?._instance?.range?.end} if you want to delete it contact administrator`,
          status: "info",
        });
      } else {
        setDelEvent({
          id: info.event.id,
          title: info.event.title,
          bg: info.event.backgroundColor,
        });
        openDel();
      }
    } else {
      toast({
        title: info.event.title,
        description: `${info.event?._instance?.range?.start} to ${info.event?._instance?.range?.end}`,
        status: "info",
      });
    }
  };
  const confirmDelete = async () => {
    const eventType = ["#CF0F47", "#FFD63A"].includes(delEvent.bg)
      ? "classes"
      : "availability";
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/${eventType}/${delEvent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((e) => e.filter((ev) => ev.id !== delEvent.id));
      toast({ title: "Deleted", status: "success" });
    } catch {
      toast({ title: "Delete failed", status: "error" });
    } finally {
      closeDel();
    }
  };

  return (
    <Box p={2}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        initialView="timeGridWeek"
        selectable
        select={handleSelect}
        events={events}
        eventClick={handleEventClick}
        editable
        nowIndicator
        weekends
        slotDuration="01:00:00"
      />

      {/* Type Modal */}
      <Modal isOpen={typeOpen} onClose={closeType} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choose Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button w="full" mb={3} onClick={() => chooseType("availability")}>
              Create Availability
            </Button>
            <Button
              w="full"
              colorScheme="blue"
              onClick={() => chooseType("meeting")}
            >
              Schedule Meeting
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Availability Modal */}
      <Modal isOpen={availOpen} onClose={closeAvail}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Availability</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>For</FormLabel>
              <Select
                value={availRole}
                onChange={(e) => setAvailRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Select {availRole}</FormLabel>
              <Select
                value={selectedAvailUser}
                onChange={(e) => setSelectedAvailUser(e.target.value)}
              >
                {availOptions.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Start</FormLabel>
              <Input
                type="datetime-local"
                value={dayjs(newEvent.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent((ne) => ({
                    ...ne,
                    start: new Date(e.target.value).toISOString(),
                  }))
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>End</FormLabel>
              <Input
                type="datetime-local"
                value={dayjs(newEvent.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent((ne) => ({
                    ...ne,
                    end: new Date(e.target.value).toISOString(),
                  }))
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeAvail}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={createAvail}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Dialog */}
      <AlertDialog
        isOpen={delOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDel}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Availability</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete "{delEvent?.title}"?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeDel}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        title={!callDetail ? "Schedule Meeting" : "Meeting Created"}
        handleClick={
          !callDetail
            ? createMeeting
            : () => {
                navigator.clipboard.writeText(`${callDetail.id}`);
                toast({ title: "Link Copied", status: "success" });
              }
        }
        buttonText={!callDetail ? "Create" : "Copy Link"}
        image={callDetail ? "/assets/icons/checked.svg" : undefined}
        buttonIcon={callDetail ? "/assets/icons/copy.svg" : undefined}
      >
        {!callDetail && (
          <>
            <Box mb={4}>
              <Input
                placeholder="Topic"
                value={meetingValues.topic}
                onChange={(e) =>
                  setMeetingValues((v) => ({ ...v, topic: e.target.value }))
                }
              />
            </Box>
            <Box mb={4}>
              <Select
                placeholder="Select a teacher"
                value={meetingValues.teacherId}
                onChange={(e) =>
                  setMeetingValues((v) => ({ ...v, teacherId: e.target.value }))
                }
              >
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </Select>
            </Box>
            <Text mb={2}>Select students (1–8)</Text>
            <ReactSelect
              isMulti
              options={studentOptions}
              value={studentOptions.filter((o) =>
                meetingValues.studentIds.includes(o.value)
              )}
              onChange={(sel) => {
                const ids = sel.map((o) => o.value);
                setMeetingValues((v) => ({
                  ...v,
                  studentIds: ids.slice(0, 8),
                }));
              }}
              closeMenuOnSelect={false}
            />
            <FormControl mt={4}>
              <FormLabel>When</FormLabel>
              <Input
                type="datetime-local"
                value={dayjs(meetingValues.dateTime).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setMeetingValues((v) => ({
                    ...v,
                    dateTime: new Date(e.target.value),
                  }))
                }
              />
            </FormControl>
          </>
        )}
      </MeetingModal>
    </Box>
  );
};

export default CalendarPage;
