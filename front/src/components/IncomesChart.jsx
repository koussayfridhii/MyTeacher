import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Spinner,
  Text,
} from "@chakra-ui/react";
import apiClient from "../hooks/apiClient";
import { useSelector } from "react-redux"; // Import useSelector
import { useMemo } from "react"; // Import useMemo

const MonthlyIncomeTable = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const [monthlyData, setMonthlyData] = useState({});
  const [loading, setLoading] = useState(true);

  const localizedMonthNames = useMemo(() => {
    if (currentLanguage === "fr") {
      return [
        "Janv",
        "Févr",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sept",
        "Oct",
        "Nov",
        "Déc",
      ];
    } else if (currentLanguage === "ar") {
      return [
        "ينا",
        "فبر",
        "مار",
        "أبر",
        "ماي",
        "يون",
        "يول",
        "أغس",
        "سبت",
        "أكت",
        "نوف",
        "ديس",
      ];
    }
    return [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  }, [currentLanguage]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/wallet/totals");
        const mb = res.data.monthlyBreakdown || {};
        setMonthlyData(mb);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const keys = Array.from(
    new Set(
      Object.values(monthlyData).flatMap((monthObj) => Object.keys(monthObj))
    )
  );

  return (
    <Box p={4} w="full">
      <Text fontSize="xl" mb={4} fontWeight="bold" color="primary">
        {currentLanguage === "fr"
          ? "Répartition mensuelle des revenus"
          : currentLanguage === "ar"
          ? "توزيع الدخل الشهري"
          : "Monthly Income Breakdown"}
      </Text>

      {loading ? (
        <Spinner />
      ) : (
        <TableContainer overflowX="auto">
          <Table
            variant="striped"
            colorScheme="blue"
            color="gray.800"
            size="sm"
          >
            <Thead bg="gray.100">
              <Tr>
                <Th>
                  {currentLanguage === "fr"
                    ? "Mois"
                    : currentLanguage === "ar"
                    ? "الشهر"
                    : "Month"}
                </Th>
                {keys.map((key) => (
                  <Th key={key} textTransform="capitalize">
                    {key}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {localizedMonthNames.map((name, idx) => {
                const monthKey = String(idx + 1);
                const row = monthlyData[monthKey] || {};

                return (
                  <Tr key={monthKey}>
                    <Td fontWeight="medium">{name}</Td>
                    {keys.map((key) => (
                      <Td key={key}>{row[key] !== undefined ? row[key] : 0}</Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MonthlyIncomeTable;
