import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import useFetchCourses from "../hooks/useFetchCourses";
import useFetchAvailabilities from "../hooks/useFetchAvailabilities";
import { useGetUsers } from "../hooks/useGetUsers";
import dayjs from "dayjs";
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
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import axios from "axios";

const CalendarPage = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ start: "", end: "" });
  const [selectInfo, setSelectInfo] = useState(null);
  const toast = useToast();
  const user = useSelector((state) => state.user.user);

  const isAdminOrCoord = user.role === "admin" || user.role === "coordinator";

  // Fetch data
  const {
    courses: upcomingCourses,
    isLoading: loadingUpcoming,
    error: upcomingError,
  } = useFetchCourses("upcoming");
  const {
    courses: endedCourses,
    isLoading: loadingEnded,
    error: endedError,
  } = useFetchCourses("ended");
  const {
    availabilities,
    isLoading: loadingAvails,
    error: availsError,
  } = useFetchAvailabilities();

  // Conditionally fetch users only for admin/coordinator
  const {
    data: users = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useGetUsers({ enabled: isAdminOrCoord });

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter students
  const studentOptions = isAdminOrCoord
    ? users.filter((s) => s?.coordinator?._id === user?._id)
    : [];
  const [selectedUserId, setSelectedUserId] = useState(
    isAdminOrCoord ? studentOptions[0]?._id || "" : user._id
  );
  // Combine events
  useEffect(() => {
    const evs = [];

    upcomingCourses?.forEach((c) => {
      evs.push({
        id: c._id,
        title: c.topic,
        start: dayjs(c.date).toISOString(),
        end: dayjs(c.date).add(2, "hour").toISOString(),
        backgroundColor: "#FFD63A",
        borderColor: "#FFD63A",
      });
    });

    endedCourses?.forEach((c) => {
      evs.push({
        id: c._id,
        title: `${c.topic} (Ended)`,
        start: dayjs(c.date).toISOString(),
        end: dayjs(c.date).add(2, "hour").toISOString(),
        backgroundColor: "#CF0F47",
        borderColor: "#CF0F47",
      });
    });

    availabilities?.data?.forEach((a) => {
      const isTeacherOrStudent =
        user.role === "teacher" || user.role === "student";
      const isOwner = a.user?._id === user._id;
      let color;
      if (isAdminOrCoord) {
        color = a.user?.role === "student" ? "#7AE2CF" : "#ACC572";
      } else if (isTeacherOrStudent && isOwner) {
        color = "#7AE2CF";
      } else {
        color = "#7AE2CF";
      }
      const title = isAdminOrCoord
        ? `${a.user?.role}: ${a.user?.firstName} ${a.user?.lastName}`
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
  }, [upcomingCourses, endedCourses, availabilities, user, isAdminOrCoord]);

  const handleDateSelect = (info) => {
    setSelectInfo(info);
    setNewEvent({ start: info.startStr, end: info.endStr });
    onOpen();
  };

  const handleCreate = async () => {
    const payload = { start: newEvent.start, end: newEvent.end };

    payload.user = isAdminOrCoord ? selectedUserId : user._id;

    const tempId = `temp-${Date.now()}`;
    const title = isAdminOrCoord
      ? `${user.role}: ${user.firstName} ${user.lastName}`
      : "Availability";

    setEvents((prev) => [
      ...prev,
      {
        id: tempId,
        title,
        start: payload.start,
        end: payload.end,
        backgroundColor: isAdminOrCoord ? "#ACC572" : "#7AE2CF",
        borderColor: isAdminOrCoord ? "#ACC572" : "#7AE2CF",
      },
    ]);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/availability`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast({ title: "Created.", status: "success", isClosable: true });
    } catch {
      toast({ title: "Failed.", status: "error", isClosable: true });
      setEvents((prev) => prev.filter((e) => e.id !== tempId));
    } finally {
      onClose();
      selectInfo?.view.calendar.unselect();
    }
  };

  const handleEventClick = (info) => {
    if (window.confirm(`Delete '${info.event.title}'?`)) {
      info.event.remove();
      setEvents((prev) => prev.filter((e) => e.id !== info.event.id));
    }
  };

  const loading =
    loadingUpcoming ||
    loadingEnded ||
    loadingAvails ||
    (isAdminOrCoord && loadingUsers);
  const error =
    upcomingError ||
    endedError ||
    availsError ||
    (isAdminOrCoord && usersError);

  if (loading)
    return (
      <Center w="full" height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  if (error) return <div>Error loading data</div>;

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
        initialView="dayGridMonth"
        selectable
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={events}
        editable
        nowIndicator
        weekends
        slotDuration="01:00:00"
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Availability</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isAdminOrCoord && (
              <FormControl mb={3}>
                <FormLabel>Select </FormLabel>
                <Select
                  placeholder="Select "
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  {studentOptions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </Select>
              </FormControl>
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
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CalendarPage;
