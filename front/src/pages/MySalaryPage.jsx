import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  VStack,
  Divider,
  Button, // Added Button
} from "@chakra-ui/react";
import apiClient from "../hooks/apiClient"; // Assuming this is your configured axios instance
import html2pdf from "html2pdf.js"; // Added html2pdf
import { useSelector } from "react-redux";
import { withAuthorization } from "../HOC/Protect";

const MySalaryPage = () => {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const language = useSelector((state) => state.language.language); // For potential translations

  const cardBgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.700", "white");

  const salaryDetailsRef = React.useRef(); // Added ref for PDF export

  // Placeholder for translations - extend as needed
  const translations = {
    title: {
      en: "My Monthly Salary",
      fr: "Mon Salaire Mensuel",
      ar: "راتبي الشهري",
    },
    baseSalary: {
      en: "Base Salary",
      fr: "Salaire de Base",
      ar: "الراتب الأساسي",
    },
    penalties: { en: "Penalties", fr: "Pénalités", ar: "الخصومات" },
    studentTopUps: {
      en: "Student Top-ups (current month)",
      fr: "Recharges Étudiants (mois actuel)",
      ar: "شحن الطلاب (الشهر الحالي)",
    },
    bonusPercentage: {
      en: "Bonus (5% of Top-ups)",
      fr: "Bonus (5% des Recharges)",
      ar: "العمولة (5% من الشحن)",
    },
    finalMonthlySalary: {
      en: "Calculated Monthly Salary",
      fr: "Salaire Mensuel Calculé",
      ar: "الراتب الشهري المحسوب",
    },
    loading: {
      en: "Loading salary details...",
      fr: "Chargement des détails du salaire...",
      ar: "جاري تحميل تفاصيل الراتب...",
    },
    errorFetching: {
      en: "Error fetching salary details.",
      fr: "Erreur lors de la récupération des détails du salaire.",
      ar: "خطأ في جلب تفاصيل الراتب.",
    },
    noData: {
      en: "No salary data available.",
      fr: "Aucune donnée de salaire disponible.",
      ar: "لا توجد بيانات راتب متاحة.",
    },
    currency: { en: "TND", fr: "TND", ar: " دينار تونسي" }, // Assuming USD, adjust if different
    exportPdf: {
      en: "Export as PDF",
      fr: "Exporter en PDF",
      ar: "تصدير كملف PDF",
    },
  };

  const t = (key) => translations[key]?.[language] || translations[key]?.en;

  useEffect(() => {
    const fetchSalaryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/salary/me");
        setSalaryData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, []);

  const handleExportPDF = () => {
    const element = salaryDetailsRef.current;
    if (element) {
      const opt = {
        margin: 0.5,
        filename: "my-salary.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true }, // useCORS might be needed if images are from other domains
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Spinner size="xl" />
        <Text ml={3}>{t("loading")}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {t("errorFetching")}: {error}
      </Alert>
    );
  }

  if (!salaryData) {
    return (
      <Alert status="info">
        <AlertIcon />
        {t("noData")}
      </Alert>
    );
  }

  const bonusAmount = salaryData.topups_total * 0.05;

  return (
    <Box p={5} maxW="xl" mx="auto" ref={salaryDetailsRef}> {/* Added ref here */}
      <VStack spacing={6} align="stretch">
        <Heading
          as="h1"
          size="xl"
          textAlign="center"
          color={headingColor}
          mb={4}
        >
          {t("title")}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <Stat
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={cardBgColor}
          >
            <StatLabel color={textColor}>{t("baseSalary")}</StatLabel>
            <StatNumber>
              {salaryData.base_salary.toLocaleString()} {t("currency")}
            </StatNumber>
          </Stat>

          <Stat
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={cardBgColor}
          >
            <StatLabel color={textColor}>{t("penalties")}</StatLabel>
            <StatNumber color="red.500">
              {salaryData.penalties.toLocaleString()} {t("currency")}
            </StatNumber>
          </Stat>

          <Stat
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={cardBgColor}
            gridColumn={{ md: "span 2" }}
          >
            <StatLabel color={textColor}>{t("studentTopUps")}</StatLabel>
            <StatNumber>
              {salaryData.topups_total.toLocaleString()} {t("currency")}
            </StatNumber>
            <StatHelpText>
              {t("bonusPercentage")}:{" "}
              {bonusAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {t("currency")}
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider my={6} />

        <Box
          textAlign="center"
          p={6}
          shadow="lg"
          borderWidth="1px"
          borderRadius="md"
          bg={useColorModeValue("primary.500", "primary.300")}
          color="white"
        >
          <Text fontSize="lg" fontWeight="medium" mb={1}>
            {t("finalMonthlySalary")}
          </Text>
          <Text fontSize="3xl" fontWeight="bold">
            {salaryData.monthly_salary.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {t("currency")}
          </Text>
        </Box>

        <Button onClick={handleExportPDF} colorScheme="teal" mt={6}>
          {t("exportPdf")}
        </Button>
      </VStack>
    </Box>
  );
};

export default withAuthorization(MySalaryPage, ["coordinator"]);
