import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Center, Spinner, Text, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Box, Button } from "@chakra-ui/react";

const CoordinatorRoute = () => {
  const { user, token, status } = useSelector((state) => state.user);
  const language = useSelector((state) => state.language.language);

  const translations = {
    loadingUser: { en: "Loading user information...", fr: "Chargement des informations utilisateur...", ar: "جاري تحميل معلومات المستخدم..." },
    accessDenied: { en: "Access Denied", fr: "Accès Refusé", ar: "الوصول مرفوض" },
    noPermission: { en: "You do not have the necessary permissions to access this page. This area is restricted to coordinators only.", fr: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page. Cette zone est réservée aux coordinateurs uniquement.", ar: "ليس لديك الأذونات اللازمة للوصول إلى هذه الصفحة. هذه المنطقة مخصصة للمنسقين فقط." },
    contactSupport: { en: "If you believe this is an error, please contact support.", fr: "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.", ar: "إذا كنت تعتقد أن هذا خطأ، فيرجى الاتصال بالدعم." },
    goBack: { en: "Go Back", fr: "Retourner", ar: "عد للخلف" },
  };

  const t = (key) => translations[key]?.[language] || translations[key]?.en;

  if (status === "loading") {
    return (
      <Center h="100vh">
        <VStack>
          <Spinner size="xl" />
          <Text mt={2}>{t('loadingUser')}</Text>
        </VStack>
      </Center>
    );
  }

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (user && user.role === "coordinator") {
    return <Outlet />;
  } else {
    return (
        <Box p={5} minH="calc(100vh - 120px)" display="flex" alignItems="center" justifyContent="center">
            <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="auto"
                borderRadius="md"
                p={8}
                maxW="lg"
            >
                <AlertIcon boxSize="50px" mr={0} />
                <AlertTitle mt={4} mb={2} fontSize="xl" fontWeight="bold">
                    {t('accessDenied')}
                </AlertTitle>
                <AlertDescription maxWidth="md">
                    {t('noPermission')} <br/> {t('contactSupport')}
                </AlertDescription>
                 <Button mt={6} colorScheme="teal" onClick={() => window.history.back()}>
                    {t('goBack')}
                </Button>
            </Alert>
        </Box>
    );
  }
};

export default CoordinatorRoute;
