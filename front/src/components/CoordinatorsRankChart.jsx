import React, { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { useCoordinators } from "../hooks/useCoordinators";
import { Center, Spinner, Flex, Text, Box, Stack } from "@chakra-ui/react";
import { useSelector } from "react-redux";

const CoordinatorsRankChart = ({ admin }) => {
  const currentLanguage = useSelector((state) => state.language.language);
  const [seriesIncome, setSeriesIncome] = useState([]);
  const [seriesStudents, setSeriesStudents] = useState([]);
  const { data: allCoordinators = [], isLoading, isError } = useCoordinators();

  useEffect(() => {
    const incomeSeries = allCoordinators.map((coordinator) => ({
      name: `${coordinator.firstName} ${coordinator.lastName}`,
      data: [coordinator.totalIncome, coordinator.incomeThisMonth],
    }));

    const studentSeries = allCoordinators.map((coordinator) => ({
      name: `${coordinator.firstName} ${coordinator.lastName}`,
      data: [
        coordinator.studentCount,
        coordinator.studentsCreatedThisMonth,
        coordinator.assignedCount,
        coordinator.assignedThisMonth,
      ],
    }));

    setSeriesIncome(incomeSeries);
    setSeriesStudents(studentSeries);
  }, [allCoordinators]);

  const optionsIncomes = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 500,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 25,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: [
          currentLanguage === "fr"
            ? "Revenu Total"
            : currentLanguage === "ar"
            ? "إجمالي الدخل"
            : "Total Income",
          currentLanguage === "fr"
            ? "Revenu ce Mois-ci"
            : currentLanguage === "ar"
            ? "الدخل هذا الشهر"
            : "Income This Month",
        ],
      },
      yaxis: {
        title: {
          text:
            currentLanguage === "fr"
              ? "Points"
              : currentLanguage === "ar"
              ? "نقاط"
              : "Points",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val) =>
            `${val}${
              currentLanguage === "fr"
                ? " points"
                : currentLanguage === "ar"
                ? " نقاط"
                : " points"
            }`,
        },
        theme: "dark",
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: "100%",
            },
          },
        },
      ],
    }),
    [currentLanguage]
  );

  const optionsStudents = useMemo(
    () => ({
      ...optionsIncomes, // Base options can be spread, but ensure language-specific parts are overridden
      xaxis: {
        categories: [
          currentLanguage === "fr"
            ? "Total Étudiants"
            : currentLanguage === "ar"
            ? "إجمالي الطلاب"
            : "Total Students",
          currentLanguage === "fr"
            ? "Étudiants ce Mois-ci"
            : currentLanguage === "ar"
            ? "الطلاب هذا الشهر"
            : "Students This Month",
          currentLanguage === "fr"
            ? "Total Assigné"
            : currentLanguage === "ar"
            ? "إجمالي المعينين"
            : "Total Assigned",
          currentLanguage === "fr"
            ? "Total Assigné ce Mois-ci"
            : currentLanguage === "ar"
            ? "إجمالي المعينين هذا الشهر"
            : "Total Assigned This Month",
        ],
      },
      yaxis: {
        title: {
          text:
            currentLanguage === "fr"
              ? "Étudiants"
              : currentLanguage === "ar"
              ? "الطلاب"
              : "Students",
        },
      },
      tooltip: {
        y: {
          formatter: (val) =>
            `${val}${
              currentLanguage === "fr"
                ? " étudiants"
                : currentLanguage === "ar"
                ? " طلاب"
                : " students"
            }`,
        },
        theme: "dark", // Assuming theme doesn't need translation
      },
    }),
    [currentLanguage, optionsIncomes]
  );
  if (isLoading)
    return (
      <Center w="full" h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  if (isError)
    return (
      <Center w="full" h="100vh">
        <Text color="red.500">
          {currentLanguage === "fr"
            ? "Erreur de chargement des données."
            : currentLanguage === "ar"
            ? "خطأ في تحميل البيانات."
            : "Error loading data."}
        </Text>
      </Center>
    );
  return (
    <Stack
      direction={["column", "column", "row"]}
      spacing={6}
      align="center"
      justify="center"
      wrap="wrap"
      w="full"
      px={[2, 4, 6]}
    >
      {admin && (
        <Box w={["100%", "100%", "48%"]}>
          <Chart
            options={optionsIncomes}
            series={seriesIncome}
            type="bar"
            height={500}
            width="100%"
          />
        </Box>
      )}
      <Box w={["100%", "100%", "48%"]}>
        <Chart
          options={optionsStudents}
          series={seriesStudents}
          type="bar"
          height={500}
          width="100%"
        />
      </Box>
    </Stack>
  );
};

export default CoordinatorsRankChart;
