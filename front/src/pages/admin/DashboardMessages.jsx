import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  Tag,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  IconButton,
  Select,
  Flex, // Added Flex for layout
  Spacer, // Added Spacer for layout
  Icon, // Added Icon for sort indicators
} from "@chakra-ui/react";
import { FaSearch, FaArrowUp, FaArrowDown } from "react-icons/fa"; // Sort icons
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"; // Pagination icons
import apiClient from "../../hooks/apiClient";
import { format } from 'date-fns';
import { withAuthorization } from "../../HOC/Protect";
import { useDebounce } from "../../hooks/useDebounce";
import { useMemo } from "react"; // Added useMemo

const DashboardMessagesComponent = () => {
  const [allMessages, setAllMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side Pagination, Search, Sort State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const cardBg = useColorModeValue("white", "gray.700");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");
  const iconColor = useColorModeValue("gray.600", "gray.400");

  // Fetch all messages once on mount
  useEffect(() => {
    const fetchAllMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/contact-messages");
        if (response.data && response.data.success) {
          setAllMessages(response.data.data);
        } else {
          setError("Failed to fetch messages or data format incorrect.");
          setAllMessages([]); // Ensure it's an array on error
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "An error occurred while fetching messages.");
        setAllMessages([]); // Ensure it's an array on error
        console.error("Fetch messages error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllMessages();
  }, []);

  // Client-side processing: filtering and sorting
  const processedMessages = useMemo(() => {
    let filtered = [...allMessages];

    if (debouncedSearchTerm) {
      filtered = filtered.filter(msg =>
        msg.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        msg.phone.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle date sorting for createdAt
        if (sortConfig.key === 'createdAt') {
          valA = new Date(valA);
          valB = new Date(valB);
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [allMessages, debouncedSearchTerm, sortConfig]);

  // Client-side pagination
  const totalPages = Math.ceil(processedMessages.length / itemsPerPage);
  const currentDisplayMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedMessages.slice(startIndex, startIndex + itemsPerPage);
  }, [processedMessages, currentPage, itemsPerPage]);

  useEffect(() => {
    // Reset to page 1 if filters change and current page becomes invalid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    } else if (totalPages === 0 && currentPage !==1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const SortableTh = ({ columnKey, children }) => (
    <Th
      onClick={() => handleSort(columnKey)}
      cursor="pointer"
      _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
    >
      <Flex align="center">
        {children}
        {sortConfig.key === columnKey && (
          <Icon
            as={sortConfig.direction === 'asc' ? FaArrowUp : FaArrowDown}
            ml={2}
            color={iconColor}
          />
        )}
      </Flex>
    </Th>
  );


  if (isLoading) { // Show full page spinner only on initial data load
    return (
      <VStack justify="center" align="center" height="60vh">
        <Spinner size="xl" />
        <Text mt={4}>Loading messages...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box p={5}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ base: 3, md: 6 }} bg={cardBg} borderRadius="lg" shadow="md">
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Contact Form Submissions
      </Heading>

      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <FaSearch color={iconColor} />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search messages (name, email, phone, message)..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>

      {currentDisplayMessages.length === 0 && !isLoading ? (
        <Text textAlign="center" py={10}>
          No messages found matching your criteria.
        </Text>
      ) : (
        <TableContainer borderWidth="1px" borderColor={tableBorderColor} borderRadius="md">
          <Table variant="simple" size="sm">
            <Thead bg={useColorModeValue("gray.50", "gray.800")}>
              <Tr>
                <SortableTh columnKey="createdAt">Date</SortableTh>
                <SortableTh columnKey="name">Name</SortableTh>
                <SortableTh columnKey="email">Email</SortableTh>
                <SortableTh columnKey="phone">Phone</SortableTh>
                <Th>Message</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentDisplayMessages.map((msg) => (
                <Tr key={msg._id} _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}>
                  <Td>
                    <Tag size="sm" colorScheme="teal" variant="subtle">
                        {format(new Date(msg.createdAt), "yyyy-MM-dd HH:mm")}
                    </Tag>
                  </Td>
                  <Td>{msg.name}</Td>
                  <Td><Text as="a" href={`mailto:${msg.email}`} color="teal.500" _hover={{textDecoration: "underline"}}>{msg.email}</Text></Td>
                  <Td><Text as="a" href={`tel:${msg.phone}`} color="teal.500" _hover={{textDecoration: "underline"}}>{msg.phone}</Text></Td>
                  <Td whiteSpace="pre-wrap" maxW={{ base: "200px", md: "300px", lg: "400px" }} overflow="hidden" textOverflow="ellipsis" title={msg.message}>
                    {msg.message}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {totalPages > 0 && (
        <Flex justify="space-between" align="center" mt={6} wrap="wrap">
          <HStack>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              aria-label="Previous Page"
            />
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              aria-label="Next Page"
            />
          </HStack>
          <Spacer />
          <HStack spacing={3} mt={{base: 2, md: 0}}>
            <Text fontSize="sm">Show:</Text>
            <Select
              size="sm"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              width="fit-content"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
            <Text fontSize="sm">per page</Text>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

const DashboardMessages = withAuthorization(DashboardMessagesComponent, ['admin', 'coordinator']);

export default DashboardMessages;
