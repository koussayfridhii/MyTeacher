import React, { useMemo } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  HStack,
  Text,
} from "@chakra-ui/react";

const UserTable = ({
  data,
  labels,
  isTeacher,
  searchValue,
  onSearchChange,
  page,
  onPageChange,
  itemsPerPage,
  onAction,
}) => {
  // Filter and paginate
  const filtered = useMemo(() => data, [data]);
  const start = (page - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <Box borderWidth={1} borderRadius="md" p={4} mb={6}>
      <Text fontSize="lg" fontWeight="bold" mb={3}>
        {isTeacher ? labels.teachers : labels.students}
      </Text>
      <Input
        placeholder={labels.search}
        mb={3}
        value={searchValue}
        onChange={(e) => {
          onSearchChange(e.target.value);
          onPageChange(1);
        }}
      />
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>{labels.balance}</Th>
            {!isTeacher && <Th>{labels.minimum}</Th>}
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((u, idx) => (
            <Tr key={u._id}>
              <Td>{start + idx + 1}</Td>
              <Td>{`${u.firstName} ${u.lastName}`}</Td>
              <Td>{u.wallet?.balance ?? "-"}</Td>
              {!isTeacher && <Td>{u.wallet?.minimum ?? "-"}</Td>}
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onAction(u, "add")}
                  >
                    {labels.add}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => onAction(u, "deduct")}
                  >
                    {labels.deduct}
                  </Button>
                  {!isTeacher && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => onAction(u, "setMin")}
                    >
                      {labels.setMin}
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack justify="space-between" mt={4}>
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          {labels.prev}
        </Button>
        <Text>
          Page {page} / {totalPages || 1}
        </Text>
        <Button
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {labels.next}
        </Button>
      </HStack>
    </Box>
  );
};

export default UserTable;
