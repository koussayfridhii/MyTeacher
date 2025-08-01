import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Progress,
  useToast,
  Spinner,
  Flex,
  Text,
  SimpleGrid,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Box as ChakraBox, // To avoid conflict with ReactQuill's Box if it had one
  Switch, // Import Switch for boolean toggles
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import apiClient from "../../hooks/apiClient";
import LexicalEditor from "../../components/LexicalEditor"; // IMPORT LexicalEditor
import { withAuthorization } from "../../HOC/Protect";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
];

// Define the structure of your landing page content fields
// This helps in generating forms and managing state
// Add all fields from your Mongoose schema
const contentFields = {
  hero_title: { label: "Hero Title", type: "text" },
  hero_subtitle: { label: "Hero Subtitle", type: "textarea" },
  hero_cta_button: { label: "Hero CTA Button Text", type: "text" },
  hero_call_button_text: { label: "Hero Call Button Text", type: "text" },
  hero_call_button_phone_number: {
    label: "Hero Call Button Phone Number",
    type: "tel",
    isLocalized: false,
  }, // Changed type to "tel"
  hero_image_url: {
    label: "Hero Image URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?q=80&w=1934&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  navbar_logo_text: { label: "Navbar Logo Text (Fallback)", type: "text" },
  navbar_logo_image_url: { label: "Navbar Logo Image URL", type: "image" },
  navbar_logo_image_alt: { label: "Navbar Logo Image Alt Text", type: "text" },
  nav_features: { label: "Nav Link: Features", type: "text" },
  nav_pricing: { label: "Nav Link: Pricing", type: "text" },
  nav_about: { label: "Nav Link: About Us", type: "text" },
  nav_teachers: { label: "Nav Link: Teachers", type: "text" },
  nav_contact: { label: "Nav Link: Contact", type: "text" },
  nav_objectives: { label: "Nav Link: Objectives", type: "text" }, // Added for Objectives nav link
  navbar_signin: { label: "Navbar Sign In Button", type: "text" },
  navbar_signup: { label: "Navbar Sign Up Button", type: "text" },
  navbar_dashboard: { label: "Navbar Dashboard Button", type: "text" }, // Added for Dashboard button
  navbar_logout: { label: "Navbar Logout Button", type: "text" }, // Added for Logout button
  language_english: { label: "Language Selector: English", type: "text" },
  language_french: { label: "Language Selector: French", type: "text" },
  language_arabic: { label: "Language Selector: Arabic", type: "text" },

  features_title: { label: "Features Section Title", type: "text" },
  feature1_title: { label: "Feature 1 Title", type: "text" },
  feature1_desc: { label: "Feature 1 Description", type: "textarea" },
  feature1_icon_url: {
    label: "Feature 1 Icon URL",
    type: "image",
    default: "/assets/icons/interactive.gif",
  },
  feature2_title: { label: "Feature 2 Title", type: "text" },
  feature2_desc: { label: "Feature 2 Description", type: "textarea" },
  feature2_icon_url: {
    label: "Feature 2 Icon URL",
    type: "image",
    default: "/assets/icons/experience.gif",
  },
  feature3_title: { label: "Feature 3 Title", type: "text" },
  feature3_desc: { label: "Feature 3 Description", type: "textarea" },
  feature3_icon_url: {
    label: "Feature 3 Icon URL",
    type: "image",
    default: "/assets/icons/support.gif",
  },

  about_us_title: { label: "About Us Title", type: "text" },
  about_us_description1: { label: "About Us Description 1", type: "richtext" },
  about_us_description2: { label: "About Us Description 2", type: "richtext" },
  about_us_description3: { label: "About Us Description 3", type: "richtext" },
  about_us_image_url: {
    label: "About Us Image URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1581929430054-760e30fe5c3b?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  about_us_image_alt: { label: "About Us Image Alt Text", type: "text" },

  objectives_title: { label: "Objectives Title", type: "text" },
  objective1_text: { label: "Objective 1 Text", type: "text" },
  objective1_image_url: { label: "Objective 1 Image URL", type: "image" },
  objective1_image_alt: { label: "Objective 1 Image Alt Text", type: "text" },
  objective2_text: { label: "Objective 2 Text", type: "text" },
  objective2_image_url: { label: "Objective 2 Image URL", type: "image" },
  objective2_image_alt: { label: "Objective 2 Image Alt Text", type: "text" },
  objective3_text: { label: "Objective 3 Text", type: "text" },
  objective3_image_url: { label: "Objective 3 Image URL", type: "image" },
  objective3_image_alt: { label: "Objective 3 Image Alt Text", type: "text" },
  objective4_text: { label: "Objective 4 Text", type: "text" },
  objective4_image_url: { label: "Objective 4 Image URL", type: "image" },
  objective4_image_alt: { label: "Objective 4 Image Alt Text", type: "text" },
  objective5_text: { label: "Objective 5 Text", type: "text" },
  objective5_image_url: { label: "Objective 5 Image URL", type: "image" },
  objective5_image_alt: { label: "Objective 5 Image Alt Text", type: "text" },

  teachers_title: { label: "Teachers Section Title", type: "text" },
  teachers_section_description: {
    label: "Teachers Section Description",
    type: "richtext",
  },
  // Teacher 1
  teacher1_avatar_url: {
    label: "Teacher 1 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1700156246325-65bbb9e1dc0d?q=80&w=1964&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  teacher1_avatar_alt: { label: "Teacher 1 Avatar Alt Text", type: "text" },
  teacher1_name: { label: "Teacher 1 Name", type: "text" },
  teacher1_title: { label: "Teacher 1 Title/Specialty", type: "text" },
  teacher1_bio: { label: "Teacher 1 Bio", type: "richtext" }, // Changed to richtext
  // Teacher 2
  teacher2_avatar_url: {
    label: "Teacher 2 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/flagged/photo-1559475555-b26777ed3ab4?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  teacher2_avatar_alt: { label: "Teacher 2 Avatar Alt Text", type: "text" },
  teacher2_name: { label: "Teacher 2 Name", type: "text" },
  teacher2_title: { label: "Teacher 2 Title/Specialty", type: "text" },
  teacher2_bio: { label: "Teacher 2 Bio", type: "richtext" }, // Changed to richtext
  // Teacher 3
  teacher3_avatar_url: {
    label: "Teacher 3 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1664382953518-4a664ab8a8c9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  teacher3_avatar_alt: { label: "Teacher 3 Avatar Alt Text", type: "text" },
  teacher3_name: { label: "Teacher 3 Name", type: "text" },
  teacher3_title: { label: "Teacher 3 Title/Specialty", type: "text" },
  teacher3_bio: { label: "Teacher 3 Bio", type: "richtext" }, // Changed to richtext
  // Teacher 4
  teacher4_avatar_url: {
    label: "Teacher 4 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/flagged/photo-1574110906643-8311b0ce29d3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  teacher4_avatar_alt: { label: "Teacher 4 Avatar Alt Text", type: "text" },
  teacher4_name: { label: "Teacher 4 Name", type: "text" },
  teacher4_title: { label: "Teacher 4 Title/Specialty", type: "text" },
  teacher4_bio: { label: "Teacher 4 Bio", type: "richtext" }, // Changed to richtext

  testimonials_title: { label: "Testimonials Section Title", type: "text" },
  // Testimonial 1
  testimonial1_quote: { label: "Testimonial 1 Quote", type: "richtext" }, // Changed to richtext
  testimonial1_avatar_url: {
    label: "Testimonial 1 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1552873816-636e43209957?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  testimonial1_avatar_alt: {
    label: "Testimonial 1 Avatar Alt Text",
    type: "text",
  },
  testimonial1_name: { label: "Testimonial 1 Name", type: "text" },
  testimonial1_role: { label: "Testimonial 1 Role", type: "text" },
  // Testimonial 2
  testimonial2_quote: { label: "Testimonial 2 Quote", type: "richtext" }, // Changed to richtext
  testimonial2_avatar_url: {
    label: "Testimonial 2 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1514355315815-2b64b0216b14?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  testimonial2_avatar_alt: {
    label: "Testimonial 2 Avatar Alt Text",
    type: "text",
  },
  testimonial2_name: { label: "Testimonial 2 Name", type: "text" },
  testimonial2_role: { label: "Testimonial 2 Role", type: "text" },
  // Testimonial 3
  testimonial3_quote: { label: "Testimonial 3 Quote", type: "richtext" }, // Changed to richtext
  testimonial3_avatar_url: {
    label: "Testimonial 3 Avatar URL",
    type: "image",
    default:
      "https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?q=80&w=2071&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  testimonial3_avatar_alt: {
    label: "Testimonial 3 Avatar Alt Text",
    type: "text",
  },
  testimonial3_name: { label: "Testimonial 3 Name", type: "text" },
  testimonial3_role: { label: "Testimonial 3 Role", type: "text" },

  prev_testimonial_aria: {
    label: "Aria Label for Previous Testimonial Button",
    type: "text",
  },
  next_testimonial_aria: {
    label: "Aria Label for Next Testimonial Button",
    type: "text",
  },

  contact_title: { label: "Contact Section Title", type: "text" },
  form_field_name: { label: "Contact Form: Name Label", type: "text" },
  form_field_name_placeholder: {
    label: "Contact Form: Name Placeholder",
    type: "text",
  },
  form_field_email: { label: "Contact Form: Email Label", type: "text" },
  form_field_email_placeholder: {
    label: "Contact Form: Email Placeholder",
    type: "text",
  },
  form_field_message: { label: "Contact Form: Message Label", type: "text" },
  form_field_message_placeholder: {
    label: "Contact Form: Message Placeholder",
    type: "text",
  },
  form_submit_button: {
    label: "Contact Form: Submit Button Text",
    type: "text",
  }, // This is multilingual

  footer_social_twitter_url: {
    label: "Footer: Twitter URL",
    type: "text",
    isLocalized: false,
  },
  footer_social_twitter_aria: {
    label: "Footer: Twitter Aria Label",
    type: "text",
  }, // isLocalized defaults to true (or not present means true for text types)
  footer_social_facebook_url: {
    label: "Footer: Facebook URL",
    type: "text",
    isLocalized: false,
  },
  footer_social_facebook_aria: {
    label: "Footer: Facebook Aria Label",
    type: "text",
  },
  footer_social_linkedin_url: {
    label: "Footer: LinkedIn URL",
    type: "text",
    isLocalized: false,
  },
  footer_social_linkedin_aria: {
    label: "Footer: LinkedIn Aria Label",
    type: "text",
  },
  footer_social_youtube_url: {
    label: "Footer: YouTube URL",
    type: "text",
    isLocalized: false,
  },
  footer_social_youtube_aria: {
    label: "Footer: YouTube Aria Label",
    type: "text",
  },
  footer_copyright: { label: "Footer: Copyright Text", type: "text" },
  back_to_top_aria: { label: "Back to Top Button Aria Label", type: "text" },
};

const LandingContentManagementPage = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({}); // Tracks uploading state per field: { fieldName: true/false }
  const [uploadProgress, setUploadProgress] = useState({}); // Tracks progress per field: { fieldName: percentage }
  const toast = useToast();
  const currentUser = useSelector((state) => state.user.user); // Assuming user state has role

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all language versions for the admin panel
      // The backend's GET /api/landing-content currently returns one lang based on query param.
      // We need to adjust it or make multiple calls if we want to edit all langs at once.
      // For simplicity, let's assume the backend /api/landing-content (no query lang) returns all data
      // OR we fetch 'en' and then provide means to update other languages.
      // The PUT request will send all languages for each field.

      // Let's fetch the raw data (all languages) by perhaps not passing a lang param,
      // assuming the backend returns everything then. If not, this needs adjustment.
      // For now, I'll assume `getLandingContent` in controller is modified to return all if no lang is specified.
      // Or, more realistically, we fetch one language (e.g., 'en') and then populate.
      // The backend `updateLandingContent` expects flat keys like `hero_title_en`.

      const response = await apiClient.get("/landing-content"); // Fetch all data, assuming API supports it

      // Initialize form with fetched data. API sends back structured like { hero_title: {en: '', fr: ''}}
      // The form state will be flat: { hero_title_en: '', hero_title_fr: '' }
      const flatData = {};
      for (const baseKey in response.data) {
        if (
          typeof response.data[baseKey] === "object" &&
          response.data[baseKey] !== null &&
          (response.data[baseKey].hasOwnProperty("en") ||
            response.data[baseKey].hasOwnProperty("fr") ||
            response.data[baseKey].hasOwnProperty("ar"))
        ) {
          languages.forEach((lang) => {
            flatData[`${baseKey}_${lang.code}`] =
              response.data[baseKey][lang.code] || "";
          });
        } else {
          // Non-localized fields like image URLs
          flatData[baseKey] = response.data[baseKey];
        }
      }
      setContent(flatData);
    } catch (error) {
      toast({
        title: "Error fetching content",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Initialize with defaults if fetch fails, so the form is usable
      const defaultState = {};
      Object.keys(contentFields).forEach((fieldKey) => {
        if (contentFields[fieldKey].type === "image") {
          defaultState[fieldKey] = contentFields[fieldKey].default || "";
        } else {
          languages.forEach((lang) => {
            defaultState[`${fieldKey}_${lang.code}`] = "";
          });
        }
      });
      setContent(defaultState);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view this page.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Consider redirecting here
    } else {
      fetchContent();
    }
  }, [fetchContent, currentUser, toast]);

  const handleInputChange = (e, fieldName, langCode = null) => {
    // For Quill, value is the HTML string. For others, it's e.target.value.
    const actualValue = e.target.value; // Reverted to standard event handling
    const key = langCode ? `${fieldName}_${langCode}` : fieldName;
    setContent((prev) => ({ ...prev, [key]: actualValue }));
  };

  const handleBooleanChange = (fieldName, value) => {
    setContent((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Specific handler for Quill to make it cleaner in the JSX
  // const handleQuillChange = (html, fieldName, langCode) => { // REMOVE
  //   const key = langCode ? `${fieldName}_${langCode}` : fieldName; // REMOVE
  //   setContent((prev) => ({ ...prev, [key]: html })); // REMOVE
  // }; // REMOVE

  const handleRichTextChange = (htmlString, fieldName, langCode) => {
    const key = langCode ? `${fieldName}_${langCode}` : fieldName;
    setContent((prev) => ({ ...prev, [key]: htmlString }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [fieldName]: true }));
    setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "react_preset"
    ); // Ensure this is in your .env

    try {
      // Using fetch for direct Cloudinary upload to use onUploadProgress
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drtmtlnwi"
        }/image/upload`, // Ensure this is in your .env
        {
          method: "POST",
          body: formData,
          // Note: onUploadProgress is easier with XHR/Axios. Fetch doesn't have direct support.
          // For simplicity, we'll update URL on completion. For progress, an XHR request would be needed.
          // Or, if using a library like `axios` which is likely in `apiClient`, use that.
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setContent((prev) => ({ ...prev, [fieldName]: data.secure_url }));
        toast({ title: "Image uploaded!", status: "success", duration: 3000 });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast({
        title: "Image upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 100 })); // Or reset, depending on UX
    }
  };

  // Simplified handleFileChange using Axios from apiClient if it's configured for general use
  // This is a more robust way if apiClient can handle external POSTs and progress
  const handleFileChangeWithAxios = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [fieldName]: true }));
    setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }));

    const form = new FormData();
    form.append("file", file);
    form.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "react_preset"
    );

    try {
      // apiClient might be configured with a baseURL. For Cloudinary, we need the full URL.
      // It's often better to use axios directly for third-party uploads.
      const axios = apiClient.defaults.adapter // Check if axios is used by apiClient
        ? (await import("axios")).default // Dynamically import axios if available
        : null;

      if (!axios) {
        // Fallback or error if axios isn't easily available via apiClient
        console.warn(
          "Axios not found via apiClient, using simplified fetch for upload."
        );
        return handleFileChange(e, fieldName); // Fallback to fetch based
      }

      const cloudName =
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "drtmtlnwi";
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        form,
        {
          onUploadProgress: (progressEvent) => {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress((prev) => ({
              ...prev,
              [fieldName]: Math.round(percent),
            }));
          },
        }
      );
      setContent((prev) => ({
        ...prev,
        [fieldName]: cloudRes.data.secure_url,
      }));
      toast({ title: "Image uploaded!", status: "success", duration: 3000 });
    } catch (err) {
      console.error("Cloudinary Upload Error (Axios):", err);
      toast({
        title: "Image upload failed",
        description: err.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // The backend expects flat data like: hero_title_en, hero_title_fr, hero_image_url
      await apiClient.put("/landing-content", content);
      toast({
        title: "Content updated successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving content",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (currentUser && currentUser.role !== "admin") {
    return (
      <Flex justify="center" align="center" height="calc(100vh - 200px)" p={5}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="md"
          maxW="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Access Denied
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You do not have the necessary permissions to manage landing page
            content. Please contact an administrator if you believe this is an
            error.
          </AlertDescription>
        </Alert>
      </Flex>
    );
  }

  const renderFormField = (fieldKey, fieldConfig) => {
    // Handle non-localized text fields (like URLs)
    if (
      (fieldConfig.type === "text" || fieldConfig.type === "tel") &&
      fieldConfig.isLocalized === false
    ) {
      return (
        <FormControl key={fieldKey} mb={6}>
          <FormLabel htmlFor={fieldKey} fontWeight="bold">
            {fieldConfig.label}
          </FormLabel>
          <Input
            id={fieldKey}
            type={fieldConfig.type} // Use fieldConfig.type for "text" or "tel"
            value={content[fieldKey] || ""}
            onChange={(e) => handleInputChange(e, fieldKey, null)} // Pass null for langCode
            placeholder={`Enter ${fieldConfig.label}`}
          />
        </FormControl>
      );
    }

    if (fieldConfig.type === "image") {
      const imageUrl = content[fieldKey] || fieldConfig.default || "";
      return (
        <FormControl key={fieldKey} mb={6}>
          <FormLabel htmlFor={fieldKey} fontWeight="bold">
            {fieldConfig.label}
          </FormLabel>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={fieldConfig.label}
              boxSize="150px"
              objectFit="cover"
              mb={2}
              border="1px solid #eee"
            />
          )}
          <Input
            type="text" // To show the URL
            id={fieldKey}
            value={imageUrl}
            onChange={(e) => handleInputChange(e, fieldKey, null)} // Pass null for langCode
            placeholder="Enter image URL or upload new"
            mb={2}
          />
          <Input
            type="file"
            id={`${fieldKey}-upload`}
            accept="image/*"
            onChange={(e) => handleFileChangeWithAxios(e, fieldKey)} // Using Axios version
            style={{ display: "none" }} // Hide default file input
          />
          <Button
            as="label"
            htmlFor={`${fieldKey}-upload`}
            leftIcon={<Icon as={FaUpload} />}
            colorScheme="teal"
            variant="outline"
            isLoading={uploading[fieldKey]}
            cursor="pointer"
          >
            Upload New Image
          </Button>
          {uploading[fieldKey] && uploadProgress[fieldKey] !== undefined && (
            <Progress value={uploadProgress[fieldKey]} size="sm" mt={2} />
          )}
        </FormControl>
      );
    }

    // For text fields, use Tabs for different languages
    return (
      <FormControl key={fieldKey} mb={6}>
        <FormLabel fontWeight="bold">{fieldConfig.label}</FormLabel>
        <Tabs variant="enclosed" colorScheme="teal" isLazy>
          <TabList>
            {languages.map((lang) => (
              <Tab key={lang.code}>{lang.name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {languages.map((lang) => (
              <TabPanel key={lang.code} p={0} pt={4}>
                {fieldConfig.type === "richtext" ? (
                  <Textarea
                    id={`${fieldKey}_${lang.code}`}
                    value={content[`${fieldKey}_${lang.code}`] || ""}
                    onChange={(e) =>
                      handleRichTextChange(e.target.value, fieldKey, lang.code)
                    }
                    rows={8} // Give a bit more space for rich text content
                    placeholder="Rich text (HTML) content - LexicalEditor temporarily replaced"
                  />
                ) : fieldConfig.type === "textarea" ? (
                  <Textarea
                    id={`${fieldKey}_${lang.code}`}
                    value={content[`${fieldKey}_${lang.code}`] || ""}
                    onChange={(e) => handleInputChange(e, fieldKey, lang.code)}
                    rows={5}
                  />
                ) : (
                  <Input
                    id={`${fieldKey}_${lang.code}`}
                    type="text"
                    value={content[`${fieldKey}_${lang.code}`] || ""}
                    onChange={(e) => handleInputChange(e, fieldKey, lang.code)}
                  />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </FormControl>
    );
  };

  // Group fields by section for better UI organization
  const sections = {
    hero: {
      title: "Hero Section",
      fields: [
        "hero_title",
        "hero_subtitle",
        "hero_cta_button",
        "hero_call_button_text",
        "hero_call_button_phone_number",
        "hero_image_url",
      ],
    },
    navbar: {
      title: "Navigation Bar",
      fields: [
        "navbar_logo_text",
        "navbar_logo_image_url",
        "navbar_logo_image_alt",
        "nav_features",
        "nav_pricing",
        "nav_about",
        "nav_teachers",
        "nav_contact",
        "nav_objectives", // Added nav_objectives field to navbar section
        "navbar_signin",
        "navbar_signup",
        "navbar_dashboard", // Added dashboard button text field
        "navbar_logout", // Added logout button text field
        "language_english",
        "language_french",
        "language_arabic",
      ],
    },
    features: {
      title: "Features Section",
      fields: [
        "features_title",
        "feature1_title",
        "feature1_desc",
        "feature1_icon_url",
        "feature2_title",
        "feature2_desc",
        "feature2_icon_url",
        "feature3_title",
        "feature3_desc",
        "feature3_icon_url",
      ],
    },
    about_us: {
      title: "About Us Section",
      fields: [
        "about_us_title",
        "about_us_description1",
        "about_us_description2",
        "about_us_description3",
        "about_us_image_url",
        "about_us_image_alt",
      ],
    },
    objectives: {
      title: "Objectives Section",
      fields: [
        "objectives_title",
        "objective1_text",
        "objective1_image_url",
        "objective1_image_alt",
        "objective2_text",
        "objective2_image_url",
        "objective2_image_alt",
        "objective3_text",
        "objective3_image_url",
        "objective3_image_alt",
        "objective4_text",
        "objective4_image_url",
        "objective4_image_alt",
        "objective5_text",
        "objective5_image_url",
        "objective5_image_alt",
      ],
    },
    teachers: {
      title: "Teachers Section",
      fields: [
        "teachers_title",
        "teachers_section_description",
        "teacher1_avatar_url",
        "teacher1_avatar_alt",
        "teacher1_name",
        "teacher1_title",
        "teacher1_bio",
        "teacher2_avatar_url",
        "teacher2_avatar_alt",
        "teacher2_name",
        "teacher2_title",
        "teacher2_bio",
        "teacher3_avatar_url",
        "teacher3_avatar_alt",
        "teacher3_name",
        "teacher3_title",
        "teacher3_bio",
        "teacher4_avatar_url",
        "teacher4_avatar_alt",
        "teacher4_name",
        "teacher4_title",
        "teacher4_bio",
      ],
    },
    testimonials: {
      title: "Testimonials Section",
      fields: [
        "testimonials_title",
        "testimonial1_quote",
        "testimonial1_avatar_url",
        "testimonial1_avatar_alt",
        "testimonial1_name",
        "testimonial1_role",
        "testimonial2_quote",
        "testimonial2_avatar_url",
        "testimonial2_avatar_alt",
        "testimonial2_name",
        "testimonial2_role",
        "testimonial3_quote",
        "testimonial3_avatar_url",
        "testimonial3_avatar_alt",
        "testimonial3_name",
        "testimonial3_role",
        "prev_testimonial_aria",
        "next_testimonial_aria",
      ],
    },
    contact: {
      title: "Contact Section",
      fields: [
        "contact_title",
        "form_field_name",
        "form_field_name_placeholder",
        "form_field_email",
        "form_field_email_placeholder",
        "form_field_message",
        "form_field_message_placeholder",
        "form_submit_button",
      ],
    },
    footer: {
      title: "Footer Section",
      fields: [
        "footer_social_twitter_url",
        "footer_social_twitter_aria",
        "footer_social_facebook_url",
        "footer_social_facebook_aria",
        "footer_social_linkedin_url",
        "footer_social_linkedin_aria",
        "footer_social_youtube_url",
        "footer_social_youtube_aria", // Renamed from _github_aria
        "footer_copyright",
        "back_to_top_aria",
      ],
    },
  };

  return (
    <Box p={8} maxW="container.xl" mx="auto">
      <Heading as="h1" mb={8} textAlign="center">
        Manage Landing Page Content
      </Heading>

      <Accordion allowMultiple defaultIndex={[0]} width="100%">
        {Object.entries(sections).map(([sectionKey, sectionConfig]) => (
          <AccordionItem key={sectionKey} mb={4}>
            <h2>
              <AccordionButton _expanded={{ bg: "teal.500", color: "white" }}>
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xl">
                  {sectionConfig.title}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel
              pb={4}
              borderWidth="1px"
              borderRadius="md"
              boxShadow="sm"
            >
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={6}
                mt={4}
              >
                {sectionConfig.fields.map((fieldKey) => (
                  <GridItem
                    key={fieldKey}
                    colSpan={{
                      base: 2,
                      md:
                        contentFields[fieldKey].type === "textarea" ||
                        contentFields[fieldKey].type === "richtext" ||
                        contentFields[fieldKey].type === "image"
                          ? 2
                          : 1,
                    }}
                  >
                    {renderFormField(fieldKey, contentFields[fieldKey])}
                  </GridItem>
                ))}
              </Grid>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        colorScheme="green"
        size="lg"
        onClick={handleSubmit}
        isLoading={saving}
        loadingText="Saving..."
        mt={10}
        width="full"
      >
        Save All Changes
      </Button>
    </Box>
  );
};

export default withAuthorization(LandingContentManagementPage, ["admin"]);
