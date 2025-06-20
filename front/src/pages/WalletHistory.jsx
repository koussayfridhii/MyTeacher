import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import apiClient from "../hooks/apiClient";
import { format } from "date-fns"; // For date formatting
import { useSelector } from "react-redux"; // Import useSelector
import { useMemo } from "react"; // Import useMemo

const WalletHistory = () => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({}); // This will hold monthlyStats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

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
      // English fallback
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
    apiClient
      .get("/wallet/history")
      .then((res) => {
        setHistory(res.data.history);
        const monthlyStats = res.data.monthlyStats || {};
        setStats(monthlyStats);

        // Process data for the chart
        const processedData = Object.entries(monthlyStats)
          .map(([monthKey, data]) => {
            const monthNumber = parseInt(monthKey.split("-")[1], 10);
            let income = 0;
            let expenditure = 0;

            Object.entries(data).forEach(([reason, amount]) => {
              if (
                [
                  "topup",
                  "bonus",
                  "freePoints",
                  "refund",
                  "adminCredit",
                ].includes(reason)
              ) {
                income += amount;
              } else if (["addClass", "adminDebit"].includes(reason)) {
                expenditure += Math.abs(amount); // Ensure expenditure is positive for the chart
              }
            });

            return {
              name:
                localizedMonthNames[monthNumber - 1] ||
                `${
                  currentLanguage === "fr"
                    ? "Mois "
                    : currentLanguage === "ar"
                    ? "شهر "
                    : "Month "
                }${monthNumber}`,
              Income: income,
              Expenditure: expenditure,
            };
          })
          .sort(
            (a, b) =>
              localizedMonthNames.indexOf(a.name) -
              localizedMonthNames.indexOf(b.name)
          ); // Sort by month

        setChartData(processedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          currentLanguage === "fr"
            ? "Échec de la récupération de l'historique du portefeuille."
            : currentLanguage === "ar"
            ? "فشل في جلب سجل المحفظة."
            : "Failed to fetch wallet history."
        );
        setLoading(false);
      });
  }, [currentLanguage, localizedMonthNames]); // Added localizedMonthNames and currentLanguage to dependency array

  return (
    <Box p={5}>
      <Heading mb={5}>
        {currentLanguage === "fr"
          ? "Historique du portefeuille"
          : currentLanguage === "ar"
          ? "سجل المحفظة"
          : "Wallet History"}
      </Heading>
      {loading && <Spinner size="xl" />}
      {error && (
        <Text color="red.500" fontSize="lg">
          {error}
        </Text>
      )}

      {!loading && !error && Object.keys(stats).length > 0 && (
        <Box bg={cardBg} p={5} borderRadius="lg" shadow="md" mt={5}>
          <Heading size="lg" mb={4} color={textColor}>
            {currentLanguage === "fr"
              ? "Résumé mensuel"
              : currentLanguage === "ar"
              ? "الملخص الشهري"
              : "Monthly Summary"}
          </Heading>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Income"
                fill="#48BB78"
                name={
                  currentLanguage === "fr"
                    ? "Revenu"
                    : currentLanguage === "ar"
                    ? "الدخل"
                    : "Income"
                }
              />
              <Bar
                dataKey="Expenditure"
                fill="#F56565"
                name={
                  currentLanguage === "fr"
                    ? "Dépense"
                    : currentLanguage === "ar"
                    ? "المصروفات"
                    : "Expenditure"
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {!loading && !error && history.length > 0 && (
        <Box bg={cardBg} p={5} borderRadius="lg" shadow="md" mt={10}>
          <Heading size="lg" mb={4} color={textColor}>
            {currentLanguage === "fr"
              ? "Détails de la transaction"
              : currentLanguage === "ar"
              ? "تفاصيل المعاملة"
              : "Transaction Details"}
          </Heading>
          <TableContainer>
            <Table variant="simple">
              <TableCaption>
                {currentLanguage === "fr"
                  ? "Historique détaillé des transactions du portefeuille"
                  : currentLanguage === "ar"
                  ? "سجل معاملات المحفظة المفصل"
                  : "Detailed Wallet Transaction History"}
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>
                    {currentLanguage === "fr"
                      ? "Date"
                      : currentLanguage === "ar"
                      ? "التاريخ"
                      : "Date"}
                  </Th>
                  <Th>
                    {currentLanguage === "fr"
                      ? "Description"
                      : currentLanguage === "ar"
                      ? "الوصف"
                      : "Description"}
                  </Th>
                  <Th isNumeric>
                    {currentLanguage === "fr"
                      ? "Montant modifié"
                      : currentLanguage === "ar"
                      ? "المبلغ المتغير"
                      : "Amount Changed"}
                  </Th>
                  <Th isNumeric>
                    {currentLanguage === "fr"
                      ? "Solde après"
                      : currentLanguage === "ar"
                      ? "الرصيد بعد"
                      : "Balance After"}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.map((item) => {
                  const amountChanged = item.newBalance - item.oldBalance;
                  const isPositive = amountChanged >= 0;
                  return (
                    <Tr key={item._id}>
                      <Td>
                        {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}
                      </Td>
                      <Td>{item.reason}</Td>
                      <Td
                        isNumeric
                        color={isPositive ? "green.500" : "red.500"}
                      >
                        {isPositive ? "+" : ""}
                        {amountChanged.toFixed(2)}
                      </Td>
                      <Td isNumeric>{item.newBalance.toFixed(2)}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {!loading &&
        !error &&
        history.length === 0 &&
        Object.keys(stats).length > 0 && (
          <Box bg={cardBg} p={5} borderRadius="lg" shadow="md" mt={10}>
            <Heading size="lg" mb={4} color={textColor}>
              {currentLanguage === "fr"
                ? "Détails de la transaction"
                : currentLanguage === "ar"
                ? "تفاصيل المعاملة"
                : "Transaction Details"}
            </Heading>
            <Text>
              {currentLanguage === "fr"
                ? "Aucun historique de transaction trouvé."
                : currentLanguage === "ar"
                ? "لم يتم العثور على سجل معاملات."
                : "No transaction history found."}
            </Text>
          </Box>
        )}

      {!loading &&
        !error &&
        Object.keys(stats).length === 0 &&
        history.length === 0 && (
          <Text mt={5} fontSize="lg">
            {currentLanguage === "fr"
              ? "Aucun historique de portefeuille ou statistique disponible pour le moment."
              : currentLanguage === "ar"
              ? "لا يوجد سجل محفظة أو إحصائيات متاحة في الوقت الحالي."
              : "No wallet history or statistics available at the moment."}
          </Text>
        )}
    </Box>
  );
};

export default WalletHistory;
