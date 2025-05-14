import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
const backUrl = import.meta.env.VITE_API_URL;
const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${backUrl}/auth/verify/${token}`);
        if (response.status === 200) {
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else if (response.status === 201) {
          toast({
            title: "link expired ,verification email resent",
            description: "Check your inbox for a new verification email.",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
        navigate("/signin");
      } catch (error) {
        toast({
          title: "Verification Failed",
          description: error.response?.data?.error || "Something went wrong.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        navigate("/signin");
      }
    };

    verifyEmail();
  }, [token, toast, navigate]);

  return null;
};

export default Verify;
