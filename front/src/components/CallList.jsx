/* eslint-disable no-unused-vars */
"use strict";
import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Box,
  SimpleGrid,
  Text,
  Spinner,
  Center,
  Input,
  Select,
  Flex,
  Stack,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import useFetchCourses from "../hooks/useFetchCourses";
import MeetingCard from "./MeetingCard";

// -- Search & Sort Component --
const SearchSort = React.memo(
  ({ searchTerm, onSearch, sortOrder, onSortChange }) => (
    <Flex mb={4} align="center" justify="space-between" wrap="wrap">
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={2}
        w={{ base: "100%" }}
        bg="secondary"
        p={2}
        borderRadius={10}
      >
        <Input
          placeholder="Search by topic or teacher"
          value={searchTerm}
          onChange={onSearch}
          color="white"
          _placeholder={{ color: "white" }}
        />
        <Select
          w="200px"
          value={sortOrder}
          onChange={onSortChange}
          color="white"
        >
          <option value="asc">Sort by Date ↑</option>
          <option value="desc">Sort by Date ↓</option>
        </Select>
        <Button
          variant="outline"
          onClick={() => onSearch({ target: { value: "" } })}
        >
          Clear
        </Button>
      </Stack>
    </Flex>
  )
);

SearchSort.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  sortOrder: PropTypes.oneOf(["asc", "desc"]).isRequired,
  onSortChange: PropTypes.func.isRequired,
};

// -- Main Component --
const CallList = ({ type }) => {
  const navigate = useNavigate();
  const { courses, isLoading, error } = useFetchCourses(type);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((val) => setSearchTerm(val), 300),
    []
  );

  const handleSearch = useCallback(
    (e) => {
      debouncedSearch(e.target.value.toLowerCase());
    },
    [debouncedSearch]
  );

  const handleSortChange = useCallback((e) => {
    setSortOrder(e.target.value);
  }, []);

  // Filter & sort
  const displayed = useMemo(() => {
    let list = [...courses];
    if (searchTerm) {
      list = list.filter(
        (c) =>
          c.topic.toLowerCase().includes(searchTerm) ||
          `${c.teacher?.firstName} ${c.teacher?.lastName}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }
    list.sort((a, b) => {
      const da = new Date(a.date),
        db = new Date(b.date);
      return sortOrder === "asc" ? da - db : db - da;
    });
    return list;
  }, [courses, searchTerm, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(displayed.length / itemsPerPage);
  const paged = displayed.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (isLoading)
    return (
      <Center py={10}>
        <Spinner thickness="4px" speed="0.65s" size="xl" color="gray.800" />
      </Center>
    );
  if (error)
    return (
      <Center py={10}>
        <Alert status="error">
          <AlertIcon />
          {error.message || "Failed to load classes."}
        </Alert>
      </Center>
    );

  return (
    <Box p={4}>
      <SearchSort
        searchTerm={searchTerm}
        onSearch={handleSearch}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {paged.length > 0 ? (
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          {paged.map((meeting) => {
            const date = dayjs(meeting.date).format("YYYY-MM-DD HH:mm");
            return (
              <MeetingCard
                key={meeting._id}
                icon={
                  type === "ended"
                    ? "/assets/icons/previous.svg"
                    : "/assets/icons/upcoming.svg"
                }
                title={meeting.topic}
                teacher={`${meeting.teacher?.firstName} ${meeting.teacher?.lastName}`}
                students={meeting.students?.length}
                date={date}
                isPreviousMeeting={type === "ended"}
                link={meeting.meetID}
                buttonText={type === "ended" ? "View" : "Start"}
                handleClick={() => navigate(`/meeting/${meeting.meetID}`)}
                role={meeting.role}
              />
            );
          })}
        </SimpleGrid>
      ) : (
        <Center py={10}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {type === "ended" ? "No Previous Calls" : "No Upcoming Calls"}
          </Text>
        </Center>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Flex mt={4} justify="center" align="center">
          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            isDisabled={page === 1}
          >
            Prev
          </Button>
          <Text mx={2}>
            {page} / {totalPages}
          </Text>
          <Button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </Flex>
      )}
    </Box>
  );
};

CallList.propTypes = {
  type: PropTypes.oneOf(["upcoming", "ended"]).isRequired,
};

export default React.memo(CallList);
