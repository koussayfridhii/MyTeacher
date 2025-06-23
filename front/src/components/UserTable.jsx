import React, { useMemo, useState } from "react";
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
  Icon,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

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
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      if (sortColumn.includes("wallet.")) {
        const keys = sortColumn.split(".");
        aValue = a[keys[0]]?.[keys[1]];
        bValue = b[keys[0]]?.[keys[1]];
      } else if (sortColumn === "name") {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      } else if (sortColumn === "totalHours") {
        aValue = a.attendedClasses.length * 2;
        bValue = b.attendedClasses.length * 2;
      } else if (sortColumn === "paid") {
        aValue = -(a.wallet?.totals?.addClass || 0);
        bValue = -(b.wallet?.totals?.addClass || 0);
      } else if (sortColumn === "refund") {
        aValue = -(a.wallet?.totals?.refund || 0);
        bValue = -(b.wallet?.totals?.refund || 0);
      }


      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }, [data, sortColumn, sortDirection]);

  // Filter and paginate
  const filtered = useMemo(() => sortedData, [sortedData]);
  const start = (page - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <Icon as={FaSortUp} /> : <Icon as={FaSortDown} />;
    }
    return <Icon as={FaSort} color="gray.400" />;
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "wallet.balance", label: labels.balance },
    ...(!isTeacher
      ? [
          { key: "wallet.totals.topup", label: labels.total },
          { key: "wallet.totals.freePoints", label: labels.free },
          { key: "wallet.totals.bonus", label: labels.bonus },
          { key: "wallet.minimum", label: labels.minimum },
          { key: "paid", label: labels.paid },
          { key: "totalHours", label: labels.totalHours },
          { key: "refund", label: labels.refund },
        ]
      : []),
  ];

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
            {columns.map((col) => (
              <Th key={col.key} onClick={() => handleSort(col.key)} cursor="pointer">
                {col.label} {renderSortIcon(col.key)}
              </Th>
            ))}
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((u, idx) => (
            <Tr key={u._id}>
              <Td>{start + idx + 1}</Td>
              <Td>{`${u.firstName} ${u.lastName}`}</Td>
              <Td>{u.wallet?.balance ?? "-"}</Td>
              {!isTeacher && <Td>{u.wallet?.totals?.topup ?? "-"}</Td>}
              {!isTeacher && <Td>{u.wallet?.totals?.freePoints ?? "-"}</Td>}
              {!isTeacher && <Td>{u.wallet?.totals?.bonus ?? "-"}</Td>}
              {!isTeacher && <Td>{u.wallet?.minimum ?? "-"}</Td>}
              {!isTeacher && <Td>{-(u.wallet?.totals?.addClass || 0)}</Td>}
              {!isTeacher && <Td>{u.attendedClasses.length * 2}</Td>}
              {!isTeacher && <Td>{-(u.wallet?.totals?.refund || 0)}</Td>}
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
