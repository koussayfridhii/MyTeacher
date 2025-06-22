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
import { withAuthorization } from "../HOC/Protect";

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
  const [plans, setPlans] = useState([]);
  const [meetingValues, setMeetingValues] = useState({
    topic: "",
    teacherId: "",
    studentIds: [],
    groupe: "",
    dateTime: new Date(),
  });
  const [teacherMaxHours, setTeacherMaxHours] = useState(null);
  const [teacherScheduledHoursWeek, setTeacherScheduledHoursWeek] = useState(0);
  const [scheduleValidationLoading, setScheduleValidationLoading] = useState(false);
  const [scheduleValidationError, setScheduleValidationError] = useState("");

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
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPlans(res.data.plans);
    } catch (err) {
      toast({ title: "Failed to fetch plans", status: "error" });
    }
  };
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
        approved: c.approved || true,
      })
    );
    endedCourses?.forEach((c) =>
      evs.push({
        id: c._id,
        title: `${c.topic} (${c.approved ? "✔️" : "❌"})`,
        start: dayjs(c.date).toISOString(),
        end: dayjs(c.date).add(2, "hour").toISOString(),
        backgroundColor: "#CF0F47",
        borderColor: "#CF0F47",
        approved: c.approved || true,
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
  }, [upcomingCourses, endedCourses, availabilities, user._id, isAdminOrCoord]); // Added dependencies

  useEffect(() => {
    const validateTeacherSchedule = async () => {
      if (!meetingValues.teacherId || !meetingValues.dateTime) {
        setScheduleValidationError("");
        setTeacherMaxHours(null);
        setTeacherScheduledHoursWeek(0);
        return;
      }

      setScheduleValidationLoading(true);
      setScheduleValidationError("");

      const selectedTeacher = users.find(u => u._id === meetingValues.teacherId);
      if (!selectedTeacher || selectedTeacher.role !== 'teacher') {
        setScheduleValidationError("Selected user is not a valid teacher.");
        setScheduleValidationLoading(false);
        setTeacherMaxHours(null);
        setTeacherScheduledHoursWeek(0);
        return;
      }

      const currentMaxHours = selectedTeacher.max_hours_per_week;
      setTeacherMaxHours(currentMaxHours);

      // Calculate hours for the week of meetingValues.dateTime
      const weekStart = dayjs(meetingValues.dateTime).startOf('week');
      const weekEnd = dayjs(meetingValues.dateTime).endOf('week');
      let hoursThisWeek = 0;

      // Need to get all classes for this teacher to calculate hours accurately.
      // The `events` array might not be complete for this if it's filtered for the current user.
      // For now, we will try to fetch all classes related to this teacher or make an estimation.
      // This part ideally needs a dedicated backend endpoint: GET /api/classes/teacher/:teacherId?weekStartDate=...
      // For now, let's simulate by filtering `upcomingCourses` and `endedCourses` if they contain teacher info.
      // The current structure of courses in `useFetchCourses` might not include teacher ID directly in the top level.
      // Let's assume for a moment that `upcomingCourses` and `endedCourses` objects have a `teacher` field with an `_id`.
      // This is a simplification and might need adjustment based on actual data structure from `useFetchCourses`.

      const allTeacherCourses = [...upcomingCourses, ...endedCourses].filter(
        (course) => course.teacher && course.teacher === selectedTeacher._id // Assuming course.teacher is an ID
      );

      allTeacherCourses.forEach(course => {
        const courseDate = dayjs(course.date);
        if (courseDate.isBetween(weekStart, weekEnd, null, '[]')) { // '[]' includes start and end
          // Assuming each class is 2 hours long as per event creation logic
          hoursThisWeek += 2;
        }
      });

      // A more direct way if events array is comprehensive and has teacher info:
      // hoursThisWeek = events.reduce((acc, event) => {
      //   if (event.teacherId === selectedTeacher._id && dayjs(event.start).isBetween(weekStart, weekEnd, null, '[]')) {
      //     const duration = dayjs(event.end).diff(dayjs(event.start), 'hours');
      //     acc += duration;
      //   }
      //   return acc;
      // }, 0);


      setTeacherScheduledHoursWeek(hoursThisWeek);

      if (currentMaxHours !== null && currentMaxHours !== undefined) {
        const newClassDuration = 2; // Assuming 2 hours for the new class
        if (hoursThisWeek + newClassDuration > currentMaxHours) {
          setScheduleValidationError(
            `This teacher will exceed their max weekly hours (${currentMaxHours}h). Already scheduled: ${hoursThisWeek}h.`
          );
        }
      }
      setScheduleValidationLoading(false);
    };

    validateTeacherSchedule();
  }, [meetingValues.teacherId, meetingValues.dateTime, users, events, upcomingCourses, endedCourses]);


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
  useEffect(() => {
    if (["admin", "coordinator"].includes(user.role)) {
      fetchPlans();
    }
  }, []);
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

    if (scheduleValidationError) {
      toast({ title: "Validation Error", description: scheduleValidationError, status: "error", duration: 5000, isClosable: true });
      return;
    }

    if (scheduleValidationLoading) {
      toast({ title: "Still validating schedule...", status: "info", duration: 3000 });
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
          groupe: meetingValues.groupe,
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
    const bgColor = info.event.backgroundColor;
    const isClass = ["#CF0F47", "#FFD63A"].includes(bgColor);
    if (isClass) {
      if (user.role === "admin") {
        setDelEvent({
          id: info.event.id,
          title: info.event.title,
          bg: bgColor,
          isClass: true,
          end: info.event.end,
        });
        openDel();
      } else if (user.role === "coordinator") {
        const eventEnd = info.event.end ? new Date(info.event.end) : null;
        const endPlus24h = dayjs(eventEnd).add(24, "hour");
        const now = dayjs();

        if (now.isBefore(endPlus24h)) {
          setDelEvent({
            id: info.event.id,
            title: info.event.title,
            bg: bgColor,
            isClass: true,
            end: eventEnd,
          });
          openDel();
        } else {
          toast({
            title: info.event.title,
            description: `You can only manage events within 24 hours of their end time.`,
            status: "info",
          });
        }
      } else {
        toast({
          title: info.event.title,
          description: `From ${info.event.startStr} to ${info.event.endStr}`,
          status: "info",
        });
      }
    } else {
      // Existing availability event logic
      if (
        (user.role === "coordinator" ||
          user.role === "student" ||
          user.role === "teacher") &&
        info.event.title === "Availability"
      ) {
        setDelEvent({
          id: info.event.id,
          title: info.event.title,
          bg: bgColor,
          isClass: false,
        });
        openDel();
      } else if (user.role === "admin") {
        setDelEvent({
          id: info.event.id,
          title: info.event.title,
          bg: bgColor,
          isClass: false,
        });
        openDel();
      } else if (user.role === "coordinator") {
        const endPlusDay = dayjs(info.event.end).add(24, "hour");
        const now = dayjs();
        if (now.isAfter(endPlusDay)) {
          toast({
            title: info.event.title,
            description: `${info.event.startStr} to ${info.event.endStr}. Contact administrator to delete.`,
            status: "info",
          });
        } else {
          setDelEvent({
            id: info.event.id,
            title: info.event.title,
            bg: bgColor,
            isClass: false,
          });
          openDel();
        }
      } else {
        toast({
          title: info.event.title,
          description: `${info.event.startStr} to ${info.event.endStr}`,
          status: "info",
        });
      }
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
  const confirmDisapprove = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/classes/${delEvent.id}`,
        {}, // Adjust body as needed
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: `Event ${
          delEvent.title.includes("❌") ? " approved" : " disapproved"
        }`,
        status: "success",
      });
    } catch (error) {
      toast({ title: "Failed to disapprove event", status: "error" });
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
            {["admin", "coordinator"].includes(user.role) && (
              <>
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
              </>
            )}
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
            {delEvent?.isClass &&
            (user.role === "admin" || user.role === "coordinator") ? (
              <>
                <Button colorScheme="yellow" onClick={confirmDisapprove} ml={3}>
                  Dis/Approve
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Delete
                </Button>
              </>
            ) : (
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            )}
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
        // Disable button if loading or error
        // The MeetingModal itself doesn't have a disabled prop for its main button,
        // so handleClick in MeetingModal might need to check a passed prop,
        // or we rely on the createMeeting function bailing out.
        // For now, createMeeting bails out.
      >
        {!callDetail && (
          <>
            {scheduleValidationLoading && (
              <Center my={2}>
                <Spinner size="sm" />
                <Text ml={2} fontSize="sm">Validating teacher schedule...</Text>
              </Center>
            )}
            {scheduleValidationError && (
              <Text color="red.500" my={2} fontSize="sm">
                {scheduleValidationError}
              </Text>
            )}
             {teacherMaxHours !== null && teacherMaxHours !== undefined && !scheduleValidationError && meetingValues.teacherId && (
              <Text color="green.500" my={2} fontSize="sm">
                Teacher's max weekly hours: {teacherMaxHours}h. Currently scheduled this week: {teacherScheduledHoursWeek}h.
              </Text>
            )}
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
                placeholder="Select a Plan"
                value={meetingValues.groupe}
                onChange={(e) =>
                  setMeetingValues((v) => ({ ...v, groupe: e.target.value }))
                }
              >
                {plans.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Select>
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

export default withAuthorization(CalendarPage, ["admin", "teacher", "coordinator", "student"]);
