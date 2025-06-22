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
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
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
  HamburgerIcon, // Import HamburgerIcon
} from "@chakra-ui/icons";
import {
  FaFacebook,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { Loader2 as LuLoader2 } from "lucide-react"; // Corrected import for loader icon

import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import apiClient from "../../hooks/apiClient"; // For fetching content
import { logout } from "../../redux/userSlice"; // Added logout action
import axios from "axios"; // Added axios for logout API call

// Create Motion-Wrapped Chakra Components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionSimpleGrid = motion(SimpleGrid);
// const MotionHeading = motion(Heading); // Not explicitly used in this refactor for section titles, but good to have if needed.

const Navbar = ({
  // t function is available globally if imported, or can be passed if preferred
  content, // Pass fetched content to Navbar
  navBgColor,
  navTextColor,
  navButtonHoverBg,
  navSignUpButtonBg,
  navSignUpButtonColor,
  navSignUpButtonHoverBg,
  navLinkHoverColor,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For Drawer
  const btnRef = React.useRef(); // For Drawer focus

  const currentLanguageFromRedux = useSelector(
    (state) => state.language.language
  );
  const { user } = useSelector((state) => state.user); // Get user from Redux state
  const token = localStorage.getItem("token"); // Get token
  const dispatch = useDispatch();
  const navigate = useNavigate(); // For navigation after logout

  // Import logout action - this needs to be at the top-level imports of the file, will adjust later if direct import in component is not standard
  // For now, assuming logout action is available or will be imported correctly.
  // Actual import: import { logout } from "../../redux/userSlice"; needs to be at file top.

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`, // Ensure VITE_API_URL is correct
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      // Handle or log error if needed, but proceed with client-side logout
      console.error("Logout API call failed:", error);
    } finally {
      dispatch(logout());
      localStorage.removeItem("token");
      // Also remove "user" from localStorage if your app does that, like in userSlice initial state
      localStorage.removeItem("user");
      navigate("/signin"); // Or to "/"
    }
  };

  const getNavText = (key, fallbackKey) =>
    content?.[key] || t(fallbackKey, currentLanguageFromRedux);
  const logoImageUrl = content?.navbar_logo_image_url;
  const logoAltText = getNavText("navbar_logo_image_alt", "Site Logo");
  const logoTextFallback = getNavText("navbar_logo_text", "Be First Learning");

  const navLinks = [
    {
      text: getNavText("nav_features", "navFeatures"),
      sectionId: "features-section",
    },
    {
      text: getNavText("nav_about", "navAbout"),
      sectionId: "about-us-section",
    },
    {
      text: getNavText("nav_objectives", "nav_objectives"),
      sectionId: "nos-objectifs-section",
    }, // Fallback key changed to nav_objectives
    {
      text: getNavText("nav_teachers", "navTeachers"),
      sectionId: "teachers-section",
    },
    {
      text: getNavText("nav_contact", "navContact"),
      sectionId: "contact-section",
    },
  ];

  const commonLinkStyles = {
    fontWeight: "medium",
    _hover: {
      textDecoration: "none",
      color: navLinkHoverColor,
    },
  };

  const desktopNavLinks = (
    <HStack
      spacing={{ md: 4, lg: 6 }}
      display={{ base: "none", md: "flex" }}
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
            onClose(); // Close drawer if open
          }}
          {...commonLinkStyles}
        >
          {link.text}
        </ChakraLink>
      ))}
    </HStack>
  );

  const desktopControls = (
    <HStack spacing={{ base: 2, md: 3 }} display={{ base: "none", md: "flex" }}>
      {token && user ? (
        <>
          <Button
            variant="ghost"
            as={Link}
            to="/dashboard"
            _hover={{ bg: navButtonHoverBg }}
          >
            {getNavText("navbar_dashboard", "navbar_dashboard")}
          </Button>
          <Button
            variant="ghost"
            colorScheme="red"
            onClick={handleLogout}
            _hover={{ bg: navButtonHoverBg }}
          >
            {getNavText("navbar_logout", "navbar_logout")}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            as={Link}
            to="/signin"
            _hover={{ bg: navButtonHoverBg }}
          >
            {getNavText("navbar_signin", "navbarSignIn")}
          </Button>
          <Button
            variant="solid"
            as={Link}
            bg={navSignUpButtonBg}
            color={navSignUpButtonColor}
            _hover={{ bg: navSignUpButtonHoverBg }}
            to="/signup"
          >
            {getNavText("navbar_signup", "navbarSignUp")}
          </Button>
        </>
      )}
      <Select
        value={currentLanguageFromRedux}
        onChange={(e) => dispatch(languageReducer(e.target.value))}
        color={useColorModeValue("black", "black")}
        bg={useColorModeValue("white", "white")}
        borderColor="teal.300"
        w="auto"
        size="sm" // Smaller select for navbar
      >
        <option value="en">
          {getNavText("language_english", "languageEnglish")}
        </option>
        <option value="fr">
          {getNavText("language_french", "languageFrench")}
        </option>
        <option value="ar">
          {getNavText("language_arabic", "languageArabic")}
        </option>
      </Select>
      <IconButton
        aria-label="Toggle color mode"
        icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        _hover={{ bg: navButtonHoverBg }}
        color={navTextColor}
      />
    </HStack>
  );

  const mobileDrawer = (
    <>
      <IconButton
        ref={btnRef}
        aria-label="Open menu"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        variant="ghost"
        display={{ base: "flex", md: "none" }}
        _hover={{ bg: navButtonHoverBg }}
        color={navTextColor}
      />
      <Drawer
        isOpen={isOpen}
        placement={currentLanguageFromRedux === "ar" ? "right" : "left"}
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent bg={navBgColor} color={navTextColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {getNavText("navbar_menu_title", "Menu")}
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {navLinks.map((link) => (
                <ChakraLink
                  key={link.sectionId}
                  href={`#${link.sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(link.sectionId)
                      ?.scrollIntoView({ behavior: "smooth" });
                    onClose();
                  }}
                  {...commonLinkStyles}
                  py={2} // Add padding for better touch target
                >
                  {link.text}
                </ChakraLink>
              ))}
              <hr /> {/* Divider */}
              {token && user ? (
                <>
                  <Button
                    variant="ghost"
                    as={Link}
                    to="/dashboard"
                    onClick={onClose}
                    width="full"
                    justifyContent="start"
                  >
                    {getNavText("navbar_dashboard", "navbar_dashboard")}
                  </Button>
                  <Button
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    width="full"
                    justifyContent="start"
                  >
                    {getNavText("navbar_logout", "navbar_logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    as={Link}
                    to="/signin"
                    onClick={onClose}
                    width="full"
                    justifyContent="start"
                  >
                    {getNavText("navbar_signin", "navbarSignIn")}
                  </Button>
                  <Button
                    variant="solid"
                    as={Link}
                    bg={navSignUpButtonBg}
                    color={navSignUpButtonColor}
                    _hover={{ bg: navSignUpButtonHoverBg }}
                    to="/signup"
                    onClick={onClose}
                    width="full"
                    justifyContent="start"
                  >
                    {getNavText("navbar_signup", "navbarSignUp")}
                  </Button>
                </>
              )}
              <Select
                value={currentLanguageFromRedux}
                onChange={(e) => {
                  dispatch(languageReducer(e.target.value));
                  // onClose(); // Optionally close drawer on language change
                }}
                color={useColorModeValue("black", "black")}
                bg={useColorModeValue("white", "white")}
                borderColor="teal.300"
                w="full" // Full width in drawer
              >
                <option value="en">
                  {getNavText("language_english", "languageEnglish")}
                </option>
                <option value="fr">
                  {getNavText("language_french", "languageFrench")}
                </option>
                <option value="ar">
                  {getNavText("language_arabic", "languageArabic")}
                </option>
              </Select>
              <Button
                leftIcon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={() => {
                  toggleColorMode();
                  // onClose(); // Optionally close drawer on theme change
                }}
                variant="ghost"
                width="full"
                justifyContent="start"
              >
                {colorMode === "light"
                  ? getNavText("theme_dark", "Dark Mode")
                  : getNavText("theme_light", "Light Mode")}
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      paddingY="1.5rem"
      paddingX={{ base: "1.5rem", md: "3rem" }}
      bg={navBgColor}
      color={navTextColor}
      dir={currentLanguageFromRedux === "ar" ? "rtl" : "ltr"}
    >
      {logoImageUrl ? (
        <ChakraImage
          src={logoImageUrl}
          alt={logoAltText}
          w="180px"
          h="50px"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/150x50?text=Logo"
        />
      ) : (
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
          {logoTextFallback}
        </Heading>
      )}

      {desktopNavLinks}
      {desktopControls}
      {mobileDrawer}
    </Flex>
  );
};

const LandingPage = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.language); // Used for API call and language selector
  const { user } = useSelector((state) => state.user); // Access user state
  const token = localStorage.getItem("token"); // Access token

  const [landingContent, setLandingContent] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [errorContent, setErrorContent] = useState(null);

  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  // Determine Hero CTA button path based on auth state
  const heroCtaPath = token && user ? "/dashboard" : "/signup";

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoadingContent(true);
      setErrorContent(null);
      try {
        const response = await apiClient.get(
          `/landing-content?lang=${currentLanguage}`
        );
        setLandingContent({
          ...response.data,
          currentLanguage: currentLanguage,
        });
      } catch (err) {
        setErrorContent(err.message || "Failed to load landing page content.");
        console.error("Failed to fetch landing content:", err);
        // Set some default content structure to prevent render errors
        setLandingContent({ currentLanguage: currentLanguage });
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchContent();
  }, [currentLanguage]);

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

  // Testimonials data will now be derived from landingContent
  const getTestimonialsData = () => {
    if (!landingContent) return [];
    const data = [];
    for (let i = 1; i <= 3; i++) {
      // Assuming up to 3 testimonials based on schema
      if (landingContent[`testimonial${i}_quote`]) {
        data.push({
          quote: landingContent[`testimonial${i}_quote`] || "Missing quote",
          avatarUrl:
            landingContent[`testimonial${i}_avatar_url`] ||
            "https://via.placeholder.com/150",
          avatarAlt:
            landingContent[`testimonial${i}_avatar_alt`] ||
            `Testimonial ${i} avatar`,
          name: landingContent[`testimonial${i}_name`] || `Name ${i}`,
          role: landingContent[`testimonial${i}_role`] || `Role ${i}`,
        });
      }
    }
    return data;
  };

  const testimonialsData = getTestimonialsData();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  useEffect(() => {
    // Reset index if testimonials data changes (e.g., on language switch)
    setCurrentTestimonialIndex(0);
  }, [currentLanguage, landingContent?.testimonial1_quote]); // Re-check if testimonial data itself changed

  const handlePrevTestimonial = () => {
    if (testimonialsData.length === 0) return;
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  const handleNextTestimonial = () => {
    if (testimonialsData.length === 0) return;
    setCurrentTestimonialIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentTestimonial = testimonialsData[currentTestimonialIndex] || {};

  const iconMap = {
    // This might not be needed if icons are URLs now
    InfoIcon: InfoIcon,
    CheckCircleIcon: CheckCircleIcon,
    SettingsIcon: SettingsIcon,
  };

  // featuresData will be derived from landingContent
  const getFeaturesData = () => {
    if (!landingContent) return [];
    const data = [];
    for (let i = 1; i <= 3; i++) {
      // Assuming up to 3 features
      if (landingContent[`feature${i}_title`]) {
        data.push({
          iconUrl:
            landingContent[`feature${i}_icon_url`] ||
            "https://via.placeholder.com/95",
          title: landingContent[`feature${i}_title`] || `Feature ${i} Title`,
          desc:
            landingContent[`feature${i}_desc`] || `Feature ${i} Description`,
        });
      }
    }
    return data;
  };
  const featuresData = getFeaturesData();

  // pricingPlansData - This section seems to be static or not covered by the dynamic fields in the schema.
  // I will leave it as is for now, assuming it's not part of this dynamic content update.
  // If it needs to be dynamic, its fields should be added to LandingContent schema and admin panel.
  const pricingPlansData = [
    {
      titleKey: "planBasicTitle", // These keys would need to map to landingContent if dynamic
      monthlyPriceKey: "planBasicPriceMonthly",
      annualPriceKey: "planBasicPriceAnnual",
      features: ["planBasicFeature1", "planBasicFeature2", "planBasicFeature3"],
      buttonVariant: "outline",
      isRecommended: false,
      cardStyles: {
        /* ... */
      },
    },
    // ... other plans
  ];

  // teachersData will be derived from landingContent
  const getTeachersData = () => {
    if (!landingContent) return [];
    const data = [];
    const teacherColors = [
      {
        border: useColorModeValue("teal.400", "teal.200"),
        title: useColorModeValue("teal.500", "teal.300"),
      },
      {
        border: useColorModeValue("purple.400", "purple.200"),
        title: useColorModeValue("purple.500", "purple.300"),
      },
      {
        border: useColorModeValue("orange.400", "orange.200"),
        title: useColorModeValue("orange.500", "orange.300"),
      },
      {
        border: useColorModeValue("pink.400", "pink.200"),
        title: useColorModeValue("pink.500", "pink.300"),
      },
    ];
    for (let i = 1; i <= 4; i++) {
      // Assuming up to 4 teachers
      if (landingContent[`teacher${i}_name`]) {
        data.push({
          avatarUrl:
            landingContent[`teacher${i}_avatar_url`] ||
            "https://via.placeholder.com/150",
          avatarAlt:
            landingContent[`teacher${i}_avatar_alt`] || `Teacher ${i} Avatar`,
          name: landingContent[`teacher${i}_name`] || `Teacher ${i} Name`,
          title: landingContent[`teacher${i}_title`] || `Teacher ${i} Title`,
          bio: landingContent[`teacher${i}_bio`] || `Teacher ${i} Bio`,
          avatarBorderColor:
            teacherColors[i - 1]?.border ||
            useColorModeValue("gray.400", "gray.200"),
          titleColor:
            teacherColors[i - 1]?.title ||
            useColorModeValue("gray.500", "gray.300"),
        });
      }
    }
    return data;
  };
  const teachersData = getTeachersData();

  // Helper to get text, with fallback
  const getText = (key, fallback = "") => landingContent?.[key] || fallback;

  if (isLoadingContent) {
    return (
      <Flex justify="center" align="center" height="100vh" direction="column">
        <LuLoader2 size={50} className="animate-spin" />
        <Text mt={4} fontSize="lg">
          Loading content...
        </Text>
      </Flex>
    );
  }

  if (errorContent) {
    return (
      <Flex
        justify="center"
        align="center"
        height="100vh"
        direction="column"
        textAlign="center"
        p={4}
      >
        <Heading size="md" color="red.500">
          Oops! Something went wrong.
        </Heading>
        <Text mt={2}>We couldn't load the page content: {errorContent}</Text>
        <Text mt={1}>Please try refreshing the page or contact support.</Text>
      </Flex>
    );
  }

  // Ensure landingContent is not null before rendering parts that depend on it
  if (!landingContent) {
    return (
      // Minimal fallback if content is null after loading (should ideally not happen if defaults are set)
      <Flex justify="center" align="center" height="100vh">
        <Text>Content not available.</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Navbar
        content={landingContent}
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
        minH="calc(100vh - 70px)"
        position="relative"
        backgroundImage={`url('${getText(
          "hero_image_url",
          "https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        )}')`}
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
            {getText(
              "hero_title",
              "Your educational partner, from school to professional life."
            )}
          </Heading>
          <Text fontSize="xl" color="white" mb={2}>
            {getText("hero_subtitle", "Success starts with Be First Learning")}
          </Text>
          <Button
            as={Link}
            to={heroCtaPath} // Use dynamic path
            colorScheme="whiteAlpha"
            size="lg"
            _hover={{ bg: "whiteAlpha.900", color: "teal.500" }}
          >
            {getText("hero_cta_button", "Get Started Now")}
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
          {getText("features_title", "Our Amazing Features")}
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
                  <ChakraImage
                    src={feature.iconUrl}
                    alt={feature.title}
                    boxSize={95}
                    mb={3}
                  />
                  <Heading as="h3" size="lg" mb={3}>
                    {feature.title}
                  </Heading>
                  <Text textAlign="center">{feature.desc}</Text>
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
        bg={useColorModeValue("blue.100", "gray.800")}
        dir={currentLanguage === "ar" ? "rtl" : "ltr"}
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
          <Box
            flex="1"
            textAlign={{
              base: "center",
              md: currentLanguage === "ar" ? "right" : "left",
            }}
            dir={currentLanguage === "ar" ? "rtl" : "ltr"}
          >
            <Heading as="h2" size="2xl" mb={6} fontWeight="bold">
              {getText("about_us_title", "About Us")}
            </Heading>
            <Box
              fontSize="lg"
              color={aboutUsTextColor}
              mb={4}
              dangerouslySetInnerHTML={{
                __html: getText(
                  "about_us_description1",
                  "<p>Default about us description 1.</p>"
                ),
              }}
            />
            <Box
              fontSize="lg"
              color={aboutUsTextColor}
              mb={6}
              dangerouslySetInnerHTML={{
                __html: getText(
                  "about_us_description2",
                  "<p>Default about us description 2.</p>"
                ),
              }}
            />
            <Box
              fontSize="lg"
              color={aboutUsTextColor}
              mb={6}
              dangerouslySetInnerHTML={{
                __html: getText(
                  "about_us_description3",
                  "<p>Default about us description 3.</p>"
                ),
              }}
            />
          </Box>

          <Box flex="1" mt={{ base: 8, md: 0 }}>
            <Image
              src={getText(
                "about_us_image_url",
                "https://via.placeholder.com/500x400?text=About+Us+Image"
              )}
              alt={getText("about_us_image_alt", "About us section image")}
              borderRadius="xl"
              boxShadow="2xl"
              objectFit="cover"
              w="100%"
              maxH="400px"
            />
          </Box>
        </MotionFlex>
      </Box>

      <Box
        id="nos-objectifs-section"
        py={20}
        px={{ base: 4, md: 8 }}
        bg={useColorModeValue("green.50", "green.900")}
        textAlign="center"
        dir={currentLanguage === "ar" ? "rtl" : "ltr"}
      >
        <Heading as="h2" size="2xl" mb={10} fontWeight="bold">
          {getText("objectives_title", "Our Objectives")}
        </Heading>
        <List
          spacing={3}
          maxW="container.md"
          mx="auto"
          textAlign={currentLanguage === "ar" ? "right" : "left"}
        >
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            {getText("objective1_text", "Objective 1 default text.")}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            {getText("objective2_text", "Objective 2 default text.")}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            {getText("objective3_text", "Objective 3 default text.")}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            {getText("objective4_text", "Objective 4 default text.")}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color="green.500" />
            {getText("objective5_text", "Objective 5 default text.")}
          </ListItem>
        </List>
      </Box>

      <Box
        id="teachers-section"
        py={20}
        px={{ base: 4, md: 8 }}
        bg={sectionSubtleBg}
        dir={currentLanguage === "ar" ? "rtl" : "ltr"}
      >
        <Heading as="h2" size="2xl" textAlign="center" mb={6} fontWeight="bold">
          {getText("teachers_title", "Meet Our Expert Teachers")}
        </Heading>
        <Text
          fontSize="lg"
          color={subtleTextColor}
          mb={12}
          textAlign="center"
          maxW="container.lg"
          mx="auto"
          px={{ base: 2, md: 4 }}
          dangerouslySetInnerHTML={{
            __html: getText(
              "teachers_section_description",
              "<p>Default description for the teachers section.</p>"
            ),
          }}
        />
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
              bg={cardBg}
              borderColor={cardBorderColor}
              _hover={{ boxShadow: "2xl", transform: "translateY(-5px)" }}
              transition="all 0.3s ease-in-out"
            >
              <Image
                src={teacher.avatarUrl}
                alt={teacher.avatarAlt}
                borderRadius="full"
                boxSize="150px"
                mx="auto"
                mb={6}
                objectFit="cover"
                border="4px solid"
                borderColor={teacher.avatarBorderColor}
              />
              <Heading as="h3" size="xl" mb={2} fontWeight="semibold">
                {teacher.name}
              </Heading>
              <Text
                color={teacher.titleColor}
                fontWeight="medium"
                fontSize="md"
                mb={4}
              >
                {teacher.title}
              </Text>
              <Box
                fontSize="sm"
                color={subtleTextColor}
                px={2}
                dangerouslySetInnerHTML={{ __html: teacher.bio }}
              />
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
        <Heading
          as="h2"
          size="2xl"
          textAlign="center"
          mb={12}
          fontWeight="bold"
        >
          {getText("testimonials_title", "What Our Students Say")}
        </Heading>
        {testimonialsData.length > 0 && currentTestimonial && (
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
                alt={currentTestimonial.avatarAlt}
                borderRadius="full"
                boxSize="120px"
                mx="auto"
                mb={6}
                objectFit="cover"
                border="4px solid"
                borderColor={testimonialImageBorderColor}
              />
              <Text
                fontSize="xl"
                fontStyle="italic"
                color={testimonialQuoteColor}
                mb={8}
                minH={{ base: "120px", md: "100px" }} // This minH might need adjustment if HTML content varies a lot
                dangerouslySetInnerHTML={{
                  __html: currentTestimonial.quote
                    ? `"${currentTestimonial.quote}"`
                    : "<p>Missing quote</p>",
                }}
              />
              {/* Quotes are often not wrapped in actual quote marks when coming from a WYSIWYG,
                so adding them here might be redundant if the editor adds them, or necessary if not.
                For now, I'm wrapping the content in quotes.
                A better approach for quotes from richtext might be to style a blockquote if the editor uses it.
            */}
              <Heading as="h4" size="lg" fontWeight="semibold" mb={1}>
                {currentTestimonial.name}
              </Heading>
              <Text color={testimonialRoleColor} fontSize="md">
                {currentTestimonial.role}
              </Text>
            </Flex>

            <IconButton
              aria-label={getText(
                "prev_testimonial_aria",
                "Previous testimonial"
              )}
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
              isDisabled={testimonialsData.length <= 1}
            />
            <IconButton
              aria-label={getText("next_testimonial_aria", "Next testimonial")}
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
              isDisabled={testimonialsData.length <= 1}
            />
          </MotionBox>
        )}
      </Box>
      <Box id="contact-section" py={20} px={{ base: 4, md: 8 }}>
        <Heading
          as="h2"
          size="2xl"
          textAlign="center"
          mb={12}
          fontWeight="bold"
        >
          {getText("contact_title", "Get In Touch")}
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
              <FormLabel>{getText("form_field_name", "Your Name")}</FormLabel>
              <Input
                type="text"
                placeholder={getText(
                  "form_field_name_placeholder",
                  "Enter your name"
                )}
              />
            </FormControl>

            <FormControl id="contact-email" isRequired>
              <FormLabel>{getText("form_field_email", "Your Email")}</FormLabel>
              <Input
                type="email"
                placeholder={getText(
                  "form_field_email_placeholder",
                  "Enter your email address"
                )}
              />
            </FormControl>

            <FormControl id="contact-message" isRequired>
              <FormLabel>
                {getText("form_field_message", "Your Message")}
              </FormLabel>
              <Textarea
                placeholder={getText(
                  "form_field_message_placeholder",
                  "Type your message here..."
                )}
                rows={6}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="full"
              mt={4}
            >
              {getText("form_submit_button", "Send Message")}
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
        bg={useColorModeValue("gray.900", "#319795")}
        textAlign="center"
      >
        <VStack spacing={4}>
          <HStack spacing={5}>
            <IconButton
              as="a"
              href={getText("footer_social_twitter_url", "#")}
              aria-label={getText(
                "footer_social_twitter_aria",
                "Follow us on Twitter"
              )}
              icon={<FaXTwitter />}
              isRound
              variant="ghost"
              color="white"
              target="_blank"
              rel="noopener noreferrer"
            />
            <IconButton
              as="a"
              href={getText("footer_social_facebook_url", "#")}
              aria-label={getText(
                "footer_social_facebook_aria",
                "Follow us on Facebook"
              )}
              icon={<FaFacebook />}
              isRound
              variant="ghost"
              color="white"
              target="_blank"
              rel="noopener noreferrer"
            />
            <IconButton
              as="a"
              href={getText("footer_social_linkedin_url", "#")}
              aria-label={getText(
                "footer_social_linkedin_aria",
                "Follow us on LinkedIn"
              )}
              icon={<FaLinkedinIn />}
              isRound
              variant="ghost"
              color="white"
              target="_blank"
              rel="noopener noreferrer"
            />
            <IconButton
              as="a"
              href={getText("footer_social_youtube_url", "#")}
              aria-label={getText(
                "footer_social_youtube_aria",
                "Follow us on YouTube"
              )}
              icon={<FaYoutube />}
              isRound
              variant="ghost"
              color="white"
              target="_blank"
              rel="noopener noreferrer"
            />
          </HStack>
          <Text fontSize="sm" color="white">
            {getText(
              "footer_copyright",
              `© ${new Date().getFullYear()} Be First Learning. All rights reserved.`
            ).replace("{year}", new Date().getFullYear())}
          </Text>
        </VStack>
      </Box>

      {showScroll && (
        <IconButton
          aria-label={getText("back_to_top_aria", "Back to top")}
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
