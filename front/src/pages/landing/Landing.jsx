import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { languageReducer } from "../../redux/languageSlice";
import { t } from "../../utils/translations";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Icon,
  IconButton,
  Select,
  Stack,
  HStack,
  VStack,
  Spacer,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  ButtonGroup,
  useColorMode,
  useColorModeValue,
  Link as ChakraLink,
  Image as ChakraImage,
} from "@chakra-ui/react";
import {
  InfoIcon,
  CheckCircleIcon,
  SettingsIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  ArrowUpIcon,
} from "@chakra-ui/icons";
import {
  FaFacebook,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Create Motion-Wrapped Chakra Components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionSimpleGrid = motion(SimpleGrid);
// const MotionHeading = motion(Heading); // Not explicitly used in this refactor for section titles, but good to have if needed.

const Navbar = ({
  currentLanguage,
  dispatch,
  languageReducer,
  t,
  navBgColor,
  navTextColor,
  navButtonHoverBg,
  navSignUpButtonBg,
  navSignUpButtonColor,
  navSignUpButtonHoverBg,
  navLinkHoverColor,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const navLinks = [
    { labelKey: "navFeatures", sectionId: "features-section" },
    { labelKey: "navPricing", sectionId: "pricing-section" },
    { labelKey: "navAbout", sectionId: "about-us-section" },
    { labelKey: "navTeachers", sectionId: "teachers-section" },
    // { labelKey: 'navTestimonials', sectionId: 'testimonials-section' }, // Optional
    { labelKey: "navContact", sectionId: "contact-section" },
  ];

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap" // Keep wrap for responsiveness
      paddingY="1.5rem"
      paddingX={{ base: "1.5rem", md: "3rem" }} // Adjust padding
      bg={navBgColor}
      color={navTextColor}
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
        {t("navbarLogo", currentLanguage)}
      </Heading>

      {/* Navigation Links - hidden on small screens, visible on md and up */}
      <HStack
        spacing={{ base: 2, md: 4, lg: 6 }} // Responsive spacing
        display={{ base: "none", md: "flex" }} // Hide on base, show on md+
        as="nav"
      >
        {navLinks.map((link) => (
          <ChakraLink
            key={link.sectionId}
            href={`#${link.sectionId}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(link.sectionId)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            fontWeight="medium"
            _hover={{
              textDecoration: "none",
              color: navLinkHoverColor,
            }}
          >
            {t(link.labelKey, currentLanguage)}
          </ChakraLink>
        ))}
      </HStack>

      {/* Right-side controls: Auth, Lang, ColorMode */}
      <HStack spacing={{ base: 2, md: 3 }}>
        {" "}
        {/* Adjusted spacing for controls */}
        <Button
          variant="ghost"
          as={Link}
          to="signin"
          _hover={{ bg: navButtonHoverBg }}
        >
          {t("navbarSignIn", currentLanguage)}
        </Button>
        <Button
          variant="solid"
          as={Link}
          bg={navSignUpButtonBg}
          color={navSignUpButtonColor}
          _hover={{ bg: navSignUpButtonHoverBg }}
          to="/signup"
        >
          {t("navbarSignUp", currentLanguage)}
        </Button>
        <Select
          value={currentLanguage}
          onChange={(e) => dispatch(languageReducer(e.target.value))}
          color={useColorModeValue("black", "black")} // Keep select text color black for readability on white bg
          bg={useColorModeValue("white", "white")} // Keep select bg white
          borderColor="teal.300"
          w="auto"
        >
          <option value="en">{t("languageEnglish", currentLanguage)}</option>
          <option value="fr">{t("languageFrench", currentLanguage)}</option>
          <option value="ar">{t("languageArabic", currentLanguage)}</option>
        </Select>
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          _hover={{ bg: navButtonHoverBg }} // Use consistent hover from props
          color={navTextColor} // Use navTextColor
        />
      </HStack>
    </Flex>
  );
};

const LandingPage = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.language);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  // Animation Variants
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Time delay between children animations
      },
    },
  };

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScroll]);

  // Define color mode values for Navbar props
  const navBgColor = useColorModeValue("teal.500", "gray.800");
  const navTextColor = useColorModeValue("white", "white"); // Navbar text is white in both modes for this design
  const navButtonHoverBg = useColorModeValue("teal.700", "gray.700"); // Adjusted for dark mode too
  const navLinkHoverColor = useColorModeValue("teal.200", "teal.300");
  const navSignUpButtonBg = useColorModeValue("white", "gray.50");
  const navSignUpButtonColor = useColorModeValue("teal.500", "gray.800");
  const navSignUpButtonHoverBg = useColorModeValue("gray.100", "gray.300");

  // Text color definitions
  const subtleTextColor = useColorModeValue("gray.600", "gray.400");
  const sectionSubtleBg = useColorModeValue("gray.50", "gray.800"); // For Teachers section
  const cardBg = useColorModeValue("#fff", "gray.700");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const aboutUsTextColor = useColorModeValue("gray.700", "gray.200");
  const testimonialCardBg = useColorModeValue("white", "gray.700");
  const testimonialQuoteColor = useColorModeValue("gray.700", "gray.200");
  const testimonialRoleColor = useColorModeValue("gray.500", "gray.400");
  const footerBorderColor = useColorModeValue("gray.200", "gray.700");
  const testimonialsSectionBg = useColorModeValue("teal.50", "teal.900"); // Adjusted for better dark mode
  const proPlanBorderColor = useColorModeValue("teal.500", "teal.300");
  const recommendedBadgeBg = useColorModeValue("teal.500", "teal.300");
  const recommendedBadgeColor = useColorModeValue("white", "gray.800");
  const testimonialImageBorderColor = useColorModeValue("teal.300", "teal.500");

  const testimonialsData = [
    {
      quoteKey: "testimonial1Quote",
      avatarUrl:
        "https://images.unsplash.com/photo-1552873816-636e43209957?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "testimonial1AvatarAlt",
      nameKey: "testimonial1Name",
      roleKey: "testimonial1Role",
    },
    {
      quoteKey: "testimonial2Quote",
      avatarUrl:
        "https://images.unsplash.com/photo-1514355315815-2b64b0216b14?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "testimonial2AvatarAlt",
      nameKey: "testimonial2Name",
      roleKey: "testimonial2Role",
    },
    {
      quoteKey: "testimonial3Quote",
      avatarUrl:
        "https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "testimonial3AvatarAlt",
      nameKey: "testimonial3Name",
      roleKey: "testimonial3Role",
    },
  ];
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentTestimonial = testimonialsData[currentTestimonialIndex];

  const iconMap = {
    InfoIcon: InfoIcon,
    CheckCircleIcon: CheckCircleIcon,
    SettingsIcon: SettingsIcon,
  };

  // featuresData needs to be defined inside LandingPage to use useColorModeValue or values derived from it.
  const featuresData = [
    {
      icon: "/assets/icons/interactive.gif",
      title: {
        ar: "دروس حية وتفاعلية",
        fr: "Des cours vivants",
        en: "Lively and interactive lessons",
      },
      desc: {
        ar: ".  مدعّمة بفيديوهات، اختبارات، حالات تطبيقية، وتمارين محلولة",
        fr: "Des cours vivants et interactifs enrichis de vidéos, quiz, cas pratiques et exercices corrigés.",
        en: "Lively and interactive lessons enriched with videos, quizzes, case studies, and solved exercises.",
      },
    },
    {
      icon: "/assets/icons/experience.gif",
      title: {
        ar: "التجربة",
        fr: "l'expérience",
        en: "the Experience",
      },
      desc: {
        ar: ".تجربة تعلم سلسة، سهلة الوصول وجذابة على جميع أجهزتكم",
        fr: "Une expérience d’apprentissage fluide, accessible et engageante sur tous vos appareils.",
        en: "A smooth, accessible, and engaging learning experience on all your devices.",
      },
    },
    {
      icon: "/assets/icons/support.gif",
      title: {
        ar: "الدعم والمتابعة",
        fr: "Le suivi personnalisé",
        en: "Support and follow up",
      },
      desc: {
        ar: ".متابعة شخصية للتقدّم حسب وتيرتك، مع موارد متاحة في أي وقت",
        fr: "Un suivi personnalisé pour progresser à votre rythme, avec des ressources toujours disponibles.",
        en: "Personalized support and follow up to progress at your own pace, with resources always available.",
      },
    },
  ];

  // pricingPlansData needs to be defined inside LandingPage to use useColorModeValue or values derived from it.
  const pricingPlansData = [
    {
      titleKey: "planBasicTitle",
      monthlyPriceKey: "planBasicPriceMonthly",
      annualPriceKey: "planBasicPriceAnnual",
      features: ["planBasicFeature1", "planBasicFeature2", "planBasicFeature3"],
      buttonVariant: "outline",
      isRecommended: false,
      cardStyles: {
        p: 8,
        borderWidth: "1px",
        borderRadius: "lg",
        bg: cardBg,
        borderColor: cardBorderColor,
        boxShadow: "md",
        _hover: { boxShadow: "xl" },
        transition: "box-shadow 0.2s",
      },
    },
    {
      titleKey: "planProTitle",
      monthlyPriceKey: "planProPriceMonthly",
      annualPriceKey: "planProPriceAnnual",
      features: [
        "planProFeature1",
        "planProFeature2",
        "planProFeature3",
        "planProFeature4",
      ],
      buttonVariant: "solid",
      isRecommended: true,
      cardStyles: {
        p: 8,
        borderWidth: "2px",
        borderColor: proPlanBorderColor,
        borderRadius: "lg",
        bg: cardBg,
        boxShadow: "xl",
        transform: { lg: "scale(1.05)" },
      },
    },
    {
      titleKey: "planBusinessTitle",
      monthlyPriceKey: "planBusinessPriceMonthly",
      annualPriceKey: "planBusinessPriceAnnual",
      features: [
        "planBusinessFeature1",
        "planBusinessFeature2",
        "planBusinessFeature3",
      ],
      buttonVariant: "outline",
      isRecommended: false,
      cardStyles: {
        p: 8,
        borderWidth: "1px",
        borderRadius: "lg",
        bg: cardBg,
        borderColor: cardBorderColor,
        boxShadow: "md",
        _hover: { boxShadow: "xl" },
        transition: "box-shadow 0.2s",
      },
    },
    {
      titleKey: "planEnterpriseTitle",
      monthlyPriceKey: "planEnterprisePriceMonthly",
      annualPriceKey: "planEnterprisePriceAnnual",
      features: [
        "planEnterpriseFeature1",
        "planEnterpriseFeature2",
        "planEnterpriseFeature3",
      ],
      buttonVariant: "outline",
      isRecommended: false,
      cardStyles: {
        p: 8,
        borderWidth: "1px",
        borderRadius: "lg",
        bg: cardBg,
        borderColor: cardBorderColor,
        boxShadow: "md",
        _hover: { boxShadow: "xl" },
        transition: "box-shadow 0.2s",
      },
    },
  ];

  // teachersData needs to be defined inside LandingPage to use useColorModeValue or values derived from it.
  const teachersData = [
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1700156246325-65bbb9e1dc0d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "teacher1AvatarAlt",
      nameKey: "teacher1Name",
      titleKey: "teacher1Title",
      bioKey: "teacher1Bio",
      avatarBorderColor: useColorModeValue("teal.400", "teal.200"),
      titleColor: useColorModeValue("teal.500", "teal.300"),
    },
    {
      avatarUrl:
        "https://images.unsplash.com/flagged/photo-1559475555-b26777ed3ab4?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "teacher2AvatarAlt",
      nameKey: "teacher2Name",
      titleKey: "teacher2Title",
      bioKey: "teacher2Bio",
      avatarBorderColor: useColorModeValue("purple.400", "purple.200"),
      titleColor: useColorModeValue("purple.500", "purple.300"),
    },
    {
      avatarUrl:
        "https://images.unsplash.com/photo-1664382953518-4a664ab8a8c9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "teacher3AvatarAlt",
      nameKey: "teacher3Name",
      titleKey: "teacher3Title",
      bioKey: "teacher3Bio",
      avatarBorderColor: useColorModeValue("orange.400", "orange.200"),
      titleColor: useColorModeValue("orange.500", "orange.300"),
    },
    {
      avatarUrl:
        "https://images.unsplash.com/flagged/photo-1574110906643-8311b0ce29d3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      avatarAltKey: "teacher4AvatarAlt",
      nameKey: "teacher4Name",
      titleKey: "teacher4Title",
      bioKey: "teacher4Bio",
      avatarBorderColor: useColorModeValue("pink.400", "pink.200"),
      titleColor: useColorModeValue("pink.500", "pink.300"),
    },
  ];

  return (
    <Box>
      <Navbar
        currentLanguage={currentLanguage}
        dispatch={dispatch}
        languageReducer={languageReducer}
        t={t}
        navBgColor={navBgColor}
        navButtonHoverBg={navButtonHoverBg}
        navSignUpButtonBg={navSignUpButtonBg}
        navSignUpButtonColor={navSignUpButtonColor}
        navSignUpButtonHoverBg={navSignUpButtonHoverBg}
        navTextColor={navTextColor}
        navLinkHoverColor={navLinkHoverColor}
      />
      <Flex
        id="hero-section"
        direction="column"
        align="center"
        justify="center"
        minH="calc(100vh - 70px)" // Assuming navbar height is roughly 70px
        position="relative"
        backgroundImage="url('https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(to-r, teal.500, green.500)"
          opacity={0.8} // Apply opacity to the gradient overlay
          zIndex="0" // Ensure it's behind the content
        />
        <VStack
          spacing={6}
          position="relative"
          zIndex="1"
          textAlign="center"
          p={8}
        >
          <Heading as="h2" size="2xl" color="white" fontWeight="bold">
            {currentLanguage === "fr"
              ? "Votre partenaire éducatif, de l’école à la vie professionnelle."
              : currentLanguage === "ar"
              ? ".شريككم في التعليم، من المدرسة إلى الحياة المهنية"
              : "Your educational partner, from school to professional life."}
          </Heading>
          <Text fontSize="xl" color="white" mb={2}>
            {currentLanguage === "fr"
              ? "Le succès commence avec Be First Learning."
              : currentLanguage === "ar"
              ? " Be First Learning" + " النجاح يبدأ مع"
              : "Success starts with Be First Learning"}
          </Text>
          <Button
            as={Link}
            to="/signup"
            colorScheme="whiteAlpha"
            size="lg"
            _hover={{ bg: "whiteAlpha.900", color: "teal.500" }}
          >
            {t("heroCtaButton", currentLanguage)}
          </Button>
        </VStack>
      </Flex>
      <Box
        id="features-section"
        py={20}
        px={{ base: 4, md: 8 }}
        textAlign="center"
      >
        <Heading as="h2" size="xl" mb={10}>
          {t("featuresTitle", currentLanguage)}
        </Heading>
        <MotionSimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={10}
          maxW="container.lg"
          mx="auto"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featuresData.map((feature, index) => {
            return (
              <MotionBox
                key={index}
                variants={fadeInUpVariants}
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                bg={cardBg}
                borderColor={cardBorderColor}
                boxShadow="md"
                _hover={{ boxShadow: "xl" }}
                transition="box-shadow 0.2s"
              >
                <Flex direction="column" align="center">
                  {<ChakraImage src={feature.icon} boxSize={95} />}
                  <Heading as="h3" size="lg" mb={3}>
                    {feature.title[currentLanguage]}
                  </Heading>
                  <Text textAlign="center">
                    {" "}
                    {feature.desc[currentLanguage]}
                  </Text>
                </Flex>
              </MotionBox>
            );
          })}
        </MotionSimpleGrid>
      </Box>

      <Box
        id="about-us-section"
        py={20}
        px={{ base: 4, md: 8 }}
        mx="auto"
        bg={useColorModeValue("blue.100", "gray.800")} // Updated
        dir={currentLanguage === "ar" ? "rtl" : "ltr"} // Added dir attribute for RTL support
      >
        <MotionFlex
          direction={{ base: "column", md: "row" }}
          align="center"
          gap={{ base: 8, md: 16 }}
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Column 1: Text Content */}
          <Box
            flex="1"
            textAlign={{
              base: "center",
              md: currentLanguage === "ar" ? "right" : "left",
            }} // Adjust text alignment based on language
            dir={currentLanguage === "ar" ? "rtl" : "ltr"}
          >
            <Heading
              as="h2"
              size="2xl"
              mb={6}
              fontWeight="bold"
              dir={currentLanguage === "ar" ? "rtl" : "ltr"}
            >
              {" "}
              {/* Default heading color should adapt */}
              {t("aboutUsTitle", currentLanguage)}
            </Heading>
            <Text fontSize="lg" color={aboutUsTextColor} mb={4}>
              {currentLanguage === "fr"
                ? "Be First Learning est une plateforme tunisienne de formation en ligne qui propose des cours de soutien scolaire (conformes aux programmes tunisiens et étrangers) et des formations pour professionnels. Elle s’adresse aux élèves, parents, enseignants et formateurs."
                : currentLanguage === "ar"
                ? " هي منصة تونسية للتكوين عن بعد، تقدّم دروس دعم مدرسي (مطابقة للبرامج التونسية والأجنبية) وتكوينات مهنية. توجّه خدماتها للتلاميذ، الأولياء، المدرّسين، والمكوّنين."
                : "Be First Learning is a Tunisian online training platform that offers academic support courses (aligned with both Tunisian and international curricula) and professional training. It is designed for students, parents, teachers, and trainers."}
            </Text>
            <Text fontSize="lg" color={aboutUsTextColor} mb={6}>
              {currentLanguage === "fr"
                ? "Les cours couvrent de nombreuses disciplines : langues (arabe, français, anglais, allemand), maths, sciences, technologie, informatique, économie-gestion, etc. Pour les professionnels, l’offre inclut communication, marketing digital, développement personnel, bureautique, comptabilité, etc."
                : currentLanguage === "ar"
                ? "تشمل الدروس عديد المواد: اللغات (العربية، الفرنسية، الإنجليزية، الألمانية)، الرياضيات، العلوم، التكنولوجيا، الإعلامية، الاقتصاد والتصرف، وغيرها. أما بالنسبة للمحترفين، فتشمل العروض مجالات مثل: التواصل، التسويق الرقمي، التنمية الذاتية، برامج المكتب، المحاسبة، وغيرها."
                : "The courses cover a wide range of subjects: languages (Arabic, French, English, German), mathematics, sciences, technology, computer science, economics and management, etc. For professionals, the offer includes communication, digital marketing, personal development, office tools, accounting, and more."}
            </Text>
            <Text fontSize="lg" color={aboutUsTextColor} mb={6}>
              {currentLanguage === "fr"
                ? "Les formations se font en direct via vidéoconférences interactives intégrées à la plateforme, sans logiciel externe. Une séance gratuite est proposée pour découvrir l’outil et évaluer le niveau."
                : currentLanguage === "ar"
                ? "تُقدَّم التكوينات مباشرة عبر حصص بالفيديو مدمجة في المنصة، دون الحاجة إلى برامج خارجية. وتُتاح حصة مجانية للتعرّف على المنصة وتقييم المستوى."
                : "Trainings are delivered live via interactive video conferencing integrated into the platform, with no external software required. A free session is offered to discover the platform and assess the learner's level."}
            </Text>
          </Box>

          {/* Column 2: Image */}
          <Box flex="1" mt={{ base: 8, md: 0 }}>
            <Image
              src="https://images.unsplash.com/photo-1581929430054-760e30fe5c3b?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt={t("aboutUsImageAlt", currentLanguage)}
              borderRadius="xl"
              boxShadow="2xl" // Fine for now
              objectFit="cover"
              w="100%"
              maxH="400px"
            />
          </Box>
        </MotionFlex>
      </Box>
      <Box
        id="teachers-section"
        py={20}
        px={{ base: 4, md: 8 }}
        bg={sectionSubtleBg}
      >
        {" "}
        {/* Updated */}
        <Heading
          as="h2"
          size="2xl"
          textAlign="center"
          mb={12}
          fontWeight="bold"
        >
          {" "}
          {/* Default heading color should adapt */}
          {t("teachersTitle", currentLanguage)}
        </Heading>
        <MotionSimpleGrid
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
          spacingX={10}
          spacingY={16}
          maxW="container.xl"
          mx="auto"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {teachersData.map((teacher, index) => (
            <MotionBox
              key={index}
              variants={fadeInUpVariants}
              p={6}
              borderWidth="1px"
              borderRadius="xl"
              boxShadow="lg"
              textAlign="center"
              bg={cardBg} // Updated
              borderColor={cardBorderColor} // Added for consistency, though individual avatar borders are more prominent
              _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
              transition="all 0.3s ease-in-out"
            >
              <Image
                src={teacher.avatarUrl}
                alt={t(teacher.avatarAltKey, currentLanguage)}
                borderRadius="full"
                boxSize="150px"
                mx="auto"
                mb={6}
                objectFit="cover"
                border="4px solid"
                borderColor={teacher.avatarBorderColor} // This is now useColorModeValue-aware from data
              />
              <Heading as="h3" size="xl" mb={2} fontWeight="semibold">
                {" "}
                {/* Default heading color should adapt */}
                {t(teacher.nameKey, currentLanguage)}
              </Heading>
              <Text
                color={teacher.titleColor}
                fontWeight="medium"
                fontSize="md"
                mb={4}
              >
                {" "}
                {/* This is now useColorModeValue-aware from data */}
                {t(teacher.titleKey, currentLanguage)}
              </Text>
              <Text fontSize="sm" color={subtleTextColor} px={2}>
                {" "}
                {/* Updated */}
                {t(teacher.bioKey, currentLanguage)}
              </Text>
            </MotionBox>
          ))}
        </MotionSimpleGrid>
      </Box>
      <Box
        id="testimonials-section"
        py={20}
        px={{ base: 4, md: 8 }}
        bg={testimonialsSectionBg}
      >
        {" "}
        {/* Updated */}
        <Heading
          as="h2"
          size="2xl"
          textAlign="center"
          mb={12}
          fontWeight="bold"
        >
          {" "}
          {/* Default heading color should adapt */}
          {t("testimonialsTitle", currentLanguage)}
        </Heading>
        <MotionBox
          maxW="lg"
          mx="auto"
          bg={testimonialCardBg}
          p={10}
          borderRadius="xl"
          boxShadow="2xl"
          position="relative"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Image
              src={currentTestimonial.avatarUrl}
              alt={t(currentTestimonial.avatarAltKey, currentLanguage)}
              borderRadius="full"
              boxSize="120px"
              mx="auto"
              mb={6}
              objectFit="cover"
              border="4px solid"
              borderColor={testimonialImageBorderColor} // Updated
            />
            <Text
              fontSize="xl"
              fontStyle="italic"
              color={testimonialQuoteColor}
              mb={8}
              minH={{ base: "120px", md: "100px" }}
            >
              {" "}
              {/* Updated */}"{t(currentTestimonial.quoteKey, currentLanguage)}"
            </Text>
            <Heading as="h4" size="lg" fontWeight="semibold" mb={1}>
              {" "}
              {/* Default heading color should adapt */}
              {t(currentTestimonial.nameKey, currentLanguage)}
            </Heading>
            <Text color={testimonialRoleColor} fontSize="md">
              {" "}
              {/* Updated */}
              {t(currentTestimonial.roleKey, currentLanguage)}
            </Text>
          </Flex>

          {/* Navigation Buttons - variant ghost and colorScheme teal should adapt well */}
          <IconButton
            aria-label={t("prevTestimonialAria", currentLanguage)}
            icon={<ArrowLeftIcon />}
            onClick={handlePrevTestimonial}
            position="absolute"
            left={{ base: 2, md: 4 }}
            top="50%"
            transform="translateY(-50%)"
            isRound
            size="lg"
            variant="ghost"
            colorScheme="teal"
          />
          <IconButton
            aria-label={t("nextTestimonialAria", currentLanguage)}
            icon={<ArrowRightIcon />}
            onClick={handleNextTestimonial}
            position="absolute"
            right={{ base: 2, md: 4 }}
            top="50%"
            transform="translateY(-50%)"
            isRound
            size="lg"
            variant="ghost"
            colorScheme="teal"
          />
        </MotionBox>
      </Box>
      <Box id="contact-section" py={20} px={{ base: 4, md: 8 }}>
        <Heading
          as="h2"
          size="2xl"
          textAlign="center"
          mb={12}
          fontWeight="bold"
        >
          {" "}
          {/* Default heading color should adapt */}
          {t("contactTitle", currentLanguage)}
        </Heading>
        <MotionBox
          maxW="lg"
          mx="auto"
          bg={cardBg}
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <VStack spacing={6} as="form" onSubmit={(e) => e.preventDefault()}>
            <FormControl id="contact-name" isRequired>
              <FormLabel>{t("formFieldName", currentLanguage)}</FormLabel>{" "}
              {/* Default label color should adapt */}
              <Input
                type="text"
                placeholder={t("formFieldNamePlaceholder", currentLanguage)}
              />{" "}
              {/* Input default styles adapt */}
            </FormControl>

            <FormControl id="contact-email" isRequired>
              <FormLabel>{t("formFieldEmail", currentLanguage)}</FormLabel>
              <Input
                type="email"
                placeholder={t("formFieldEmailPlaceholder", currentLanguage)}
              />
            </FormControl>

            <FormControl id="contact-message" isRequired>
              <FormLabel>{t("formFieldMessage", currentLanguage)}</FormLabel>
              <Textarea
                placeholder={t("formFieldMessagePlaceholder", currentLanguage)}
                rows={6}
              />{" "}
              {/* Textarea default styles adapt */}
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="full"
              mt={4}
            >
              {" "}
              {/* Button colorScheme should adapt */}
              {t("formSubmitButton", currentLanguage)}
            </Button>
          </VStack>
        </MotionBox>
      </Box>

      <Box
        as="footer"
        py={10}
        px={{ base: 4, md: 8 }}
        borderTopWidth="1px"
        borderColor={footerBorderColor}
        mt={16}
      >
        {" "}
        {/* Updated */}
        <VStack spacing={4}>
          <HStack spacing={5}>
            {" "}
            {/* IconButtons with colorScheme should adapt */}
            <IconButton
              as="a"
              href="#"
              aria-label={t("footerSocialTwitterAria", currentLanguage)}
              icon={<FaXTwitter />}
              isRound
              variant="ghost"
              colorScheme="blue"
            />
            <IconButton
              as="a"
              href="#"
              aria-label={t("footerSocialFacebookAria", currentLanguage)}
              icon={<FaFacebook />}
              isRound
              variant="ghost"
              colorScheme="facebook"
            />
            <IconButton
              as="a"
              href="#"
              aria-label={t("footerSocialLinkedinAria", currentLanguage)}
              icon={<FaLinkedinIn />}
              isRound
              variant="ghost"
              colorScheme="linkedin"
            />
            <IconButton
              as="a"
              href="#"
              aria-label={t("footerSocialGithubAria", currentLanguage)}
              icon={<FaYoutube />}
              isRound
              variant="ghost"
              colorScheme="gray"
            />
          </HStack>
          <Text fontSize="sm" color={subtleTextColor}>
            {" "}
            {/* Updated */}
            {t("footerCopyright", currentLanguage, {
              year: new Date().getFullYear(),
            })}
          </Text>
        </VStack>
      </Box>

      {showScroll && (
        <IconButton
          aria-label={t("backToTopAria", currentLanguage)}
          icon={<ArrowUpIcon />}
          onClick={scrollToTop}
          position="fixed"
          bottom="30px"
          right="30px"
          zIndex="sticky"
          colorScheme="teal"
          isRound
          size="lg"
          boxShadow="lg"
        />
      )}
    </Box>
  );
};

export default LandingPage;
