/* eslint-disable no-unused-vars */
"use strict";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
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
  Divider,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import useFetchCourses from "../hooks/useFetchCourses";
import { useSelector } from "react-redux";

// -- Search & Sort Component --
const SearchSort = React.memo(
  ({ searchTerm, onSearch, sortOrder, onSortChange, currentLanguage }) => (
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
          placeholder={
            currentLanguage === "fr"
              ? "Rechercher par sujet ou professeur"
              : currentLanguage === "ar"
              ? "البحث حسب الموضوع أو المعلم"
              : "Search by topic or teacher"
          }
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
          <option value="asc">
            {currentLanguage === "fr"
              ? "Trier par Date ↑"
              : currentLanguage === "ar"
              ? "فرز حسب التاريخ ↑"
              : "Sort by Date ↑"}
          </option>
          <option value="desc">
            {currentLanguage === "fr"
              ? "Trier par Date ↓"
              : currentLanguage === "ar"
              ? "فرز حسب التاريخ ↓"
              : "Sort by Date ↓"}
          </option>
        </Select>
        <Button
          variant="outline"
          onClick={() => onSearch({ target: { value: "" } })}
        >
          {currentLanguage === "fr"
            ? "Effacer"
            : currentLanguage === "ar"
            ? "مسح"
            : "Clear"}
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
  currentLanguage: PropTypes.string.isRequired,
};

// -- Main Component --
const CallList = ({ type }) => {
  const navigate = useNavigate();
  const { courses, isLoading, error } = useFetchCourses(type);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const user = useSelector((state) => state.user.user);
  const currentLanguage = useSelector((state) => state.language.language);
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
  const totalPages = Math.ceil(displayed?.length / itemsPerPage);
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
          {error.message ||
            (currentLanguage === "fr"
              ? "Échec du chargement des cours."
              : currentLanguage === "ar"
              ? "فشل تحميل الفصول الدراسية."
              : "Failed to load classes.")}
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
        currentLanguage={currentLanguage}
      />

      {paged?.length > 0 ? (
        <List spacing={4}>
          {paged.map((meeting) => {
            const dateStr = dayjs(meeting.date).format("YYYY-MM-DD HH:mm");
            console.log(meeting);
            return (
              <ListItem key={meeting._id}>
                <Flex
                  align="center"
                  justify="space-between"
                  p={4}
                  bg="gray.50"
                  borderRadius={8}
                >
                  <Box>
                    <Text fontWeight="bold">{meeting.topic}</Text>
                    <Text fontSize="sm">
                      {currentLanguage === "fr"
                        ? "Professeur: "
                        : currentLanguage === "ar"
                        ? "المعلم: "
                        : "Teacher: "}
                      {meeting.teacher?.firstName} {meeting.teacher?.lastName}
                    </Text>
                    {user.role !== "teacher" && (
                      <Text fontWeight="bold" color="primary">
                        {currentLanguage === "fr"
                          ? "Coût : "
                          : currentLanguage === "ar"
                          ? "التكلفة : "
                          : "Cost : "}
                        {meeting.cost}
                      </Text>
                    )}
                    <Tooltip
                      label={meeting.students.map(
                        (s) => `${s.firstName} ${s.lastName}, `
                      )}
                      aria-label={
                        currentLanguage === "fr"
                          ? "Une info-bulle"
                          : currentLanguage === "ar"
                          ? "تلميح"
                          : "A tooltip"
                      }
                      cursor="pointer"
                    >
                      <Text fontSize="sm">
                        {currentLanguage === "fr"
                          ? "Étudiants: "
                          : currentLanguage === "ar"
                          ? "الطلاب: "
                          : "Students: "}
                        {meeting.students?.length || 0}
                      </Text>
                    </Tooltip>
                    {type === "ended" &&
                      ["admin", "coordinator"].includes(user.role) && (
                        <Tooltip
                          label={meeting.presentStudents?.map(
                            (s) => `${s.firstName} ${s.lastName},`
                          )}
                          aria-label={
                            currentLanguage === "fr"
                              ? "Une info-bulle"
                              : currentLanguage === "ar"
                              ? "تلميح"
                              : "A tooltip"
                          }
                          cursor="pointer"
                        >
                          <Text fontWeight="semibold">
                            {currentLanguage === "fr"
                              ? "Étudiants Présents"
                              : currentLanguage === "ar"
                              ? "الطلاب الحاضرون"
                              : "Present Students"}{" "}
                            {meeting.presentStudents?.length}
                          </Text>
                        </Tooltip>
                      )}
                    {user.role === "student" &&
                      type === "ended" &&
                      (meeting?.presentStudents?.includes(user._id) ? (
                        <Badge colorScheme="green" variant="solid">
                          {currentLanguage === "fr"
                            ? "Présent"
                            : currentLanguage === "ar"
                            ? "حاضر"
                            : "Present"}{" "}
                        </Badge>
                      ) : (
                        <Badge colorScheme="red" variant="solid">
                          {currentLanguage === "fr"
                            ? "Absent"
                            : currentLanguage === "ar"
                            ? "غائب"
                            : "Absent"}{" "}
                        </Badge>
                      ))}
                    <Text fontSize="sm">
                      {currentLanguage === "fr"
                        ? "Date"
                        : currentLanguage === "ar"
                        ? "التاريخ"
                        : "Date"}
                      : {dateStr}
                    </Text>
                  </Box>
                  {["now"].includes(type) && (
                    <Button
                      onClick={() =>
                        navigate(`/dashboard/meeting/${meeting.meetID}`)
                      }
                      colorScheme={type === "ended" ? "blue" : "teal"}
                    >
                      {currentLanguage === "fr"
                        ? "Commencer"
                        : currentLanguage === "ar"
                        ? "بدء"
                        : "Start"}
                    </Button>
                  )}
                </Flex>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Center py={10}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {type === "ended"
              ? currentLanguage === "fr"
                ? "Aucun appel précédent"
                : currentLanguage === "ar"
                ? "لا توجد مكالمات سابقة"
                : "No Previous Calls"
              : currentLanguage === "fr"
              ? "Aucun appel à venir"
              : currentLanguage === "ar"
              ? "لا توجد مكالمات قادمة"
              : "No Upcoming Calls"}
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
            {currentLanguage === "fr"
              ? "Précédent"
              : currentLanguage === "ar"
              ? "السابق"
              : "Previous"}
          </Button>
          <Text mx={2}>
            {page}
            {currentLanguage === "fr"
              ? " / "
              : currentLanguage === "ar"
              ? " / "
              : " / "}
            {totalPages}
          </Text>
          <Button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            isDisabled={page === totalPages}
          >
            {currentLanguage === "fr"
              ? "Suivant"
              : currentLanguage === "ar"
              ? "التالي"
              : "Next"}
          </Button>
        </Flex>
      )}
    </Box>
  );
};

CallList.propTypes = {
  type: PropTypes.oneOf(["upcoming", "ended", "now"]).isRequired,
};

export default React.memo(CallList);
