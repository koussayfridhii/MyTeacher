import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useCoordinators } from "../hooks/useCoordinators";
import { Center, Spinner, Flex, Text, Box, Stack } from "@chakra-ui/react";

const CoordinatorsRankChart = () => {
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

  if (isLoading)
    return (
      <Center w="full" h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  if (isError)
    return (
      <Center w="full" h="100vh">
        <Text color="red.500">Error loading data.</Text>
      </Center>
    );

  const optionsIncomes = {
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
      categories: ["total income", "income This Month"],
    },
    yaxis: {
      title: {
        text: "Points",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} points`,
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
  };

  const optionsStudents = {
    ...optionsIncomes,
    xaxis: {
      categories: [
        "total students",
        "Students This Month",
        "total assigned",
        "total assigned this month",
      ],
    },
    yaxis: {
      title: {
        text: "Students",
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} students`,
      },
      theme: "dark",
    },
  };

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
      <Box w={["100%", "100%", "48%"]}>
        <Chart
          options={optionsIncomes}
          series={seriesIncome}
          type="bar"
          height={500}
          width="100%"
        />
      </Box>
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
