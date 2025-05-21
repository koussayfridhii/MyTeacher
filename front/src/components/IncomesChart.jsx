import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import apiClient from "../hooks/apiClient";

const monthNames = [
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

const IncomesChart = () => {
  const [series, setSeries] = useState([
    { name: "Topup", data: Array(12).fill(0) },
    { name: "Refund", data: Array(12).fill(0) }, // Added Refund series
  ]);
  const [options, setOptions] = useState({
    chart: { height: 500, type: "line", zoom: { enabled: true } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    title: { text: "Monthly Topups and Refunds", align: "left" },
    grid: {
      row: { colors: ["#f3f3f3", "transparent"], opacity: 0.5 },
    },
    xaxis: { categories: monthNames },
    tooltip: {
      theme: "dark", // <--- This sets the tooltip dark theme
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/wallet/totals");
        const mb = res.data.monthlyBreakdown || {};

        const topupData = monthNames.map((_, idx) => {
          const monthKey = String(idx + 1);
          return mb[monthKey]?.topup ?? 0;
        });

        const refundData = monthNames.map((_, idx) => {
          const monthKey = String(idx + 1);
          return mb[monthKey]?.refund ?? 0;
        });
        const unfinishedSessionsData = monthNames.map((_, idx) => {
          const monthKey = String(idx + 1);
          return mb[monthKey]?.["unfinished session"] ?? 0;
        });

        setSeries([
          { name: "Topup", data: topupData },
          { name: "Refund", data: refundData },
          { name: "unfinished session", data: unfinishedSessionsData },
        ]);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="line"
        height={500}
        width={1000}
      />
    </div>
  );
};

export default IncomesChart;
