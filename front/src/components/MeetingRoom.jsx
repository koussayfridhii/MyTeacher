import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Users, LayoutList } from "lucide-react";

import PendingRequestsPanel from "./PendingRequestsPanel";
import CustomCallControls from "./CustomCallControls";
import EndCallButton from "./EndCallButton";
import { useIsMeetingOwner } from "../hooks/useIsMeetingOwner";
import { cn } from "../utils/utils";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Center,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import axios from "axios";
import { attendClass } from "../redux/userSlice";
import { useDispatch } from "react-redux";
const baseURL = import.meta.env.VITE_API_URL;
export default function MeetingRoom() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isOwner = useIsMeetingOwner();
  const token = localStorage.getItem("token");
  const isPersonal = new URLSearchParams(location.search).get("personal");
  const [layout, setLayout] = useState("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [canJoin, setCanJoin] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const dispatch = useDispatch();
  // extract hooks including the blockedUsersSearchFn
  const { useCallCallingState, blockedUsersSearchFn } = useCallStateHooks();
  const callingState = useCallCallingState();
  // check if the user already has the class or sufficient points either redirect him to menu with toast that he has not points
  useEffect(() => {
    const checkUser = async () => {
      if (isOwner) {
        setCanJoin(true);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`${baseURL}/users/userClasses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const hasClass = data.attendedClasses.some(
          (c) => c.meetID === location.pathname.replace("/meeting/", "")
        );
        if (!hasClass) {
          // instead of toast+redirect, open the purchase prompt
          onOpen();
          setCanJoin(false);
        } else {
          setCanJoin(true);
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        toast({
          title: "Failed to check access. Please try again or contact support.",
          status: "error",
          duration: 3000,
        });
        setCanJoin(false);
        setLoading(false);
      }
    };

    checkUser();
  }, [isOwner, location.pathname, token, toast, onOpen, canJoin, loading]);
  const handlePurchase = async () => {
    try {
      setLoading(true);
      // 1) hit the purchase-and-enroll endpoint
      const { data } = await axios.post(
        `${baseURL}/users/push-class`, // <-- your purchase endpoint
        { classId: location.pathname.replace("/meeting/", "") }, // pass the meetID
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 2) unpack
      const { attendedClasses, walletBalance } = data;

      // 3) update Redux
      dispatch(
        attendClass({
          attendedClasses,
          balance: walletBalance,
        })
      );

      // 4) navigate into the meeting
      setCanJoin(true);
      setLoading(false);
      onClose();
    } catch (err) {
      // 5) if it’s a 400-insufficient-funds from the server...
      setLoading(false);
      console.log(err);
      if (
        err.response?.status === 400 &&
        err.response.data.error?.toLowerCase().includes("insufficient")
      ) {
        toast({
          title: "Not enough points in your wallet.",
          description: "Please top up before joining this meeting.",
          status: "warning",
          duration: 4000,
        });
        // redirect to your wallet top-up or purchase page
      } else {
        setLoading(false);
        // 6) generic failure
        console.error("Failed to buy & join class:", err);
        toast({
          title: "Failed to join Meeting",
          description: err.response?.data?.error || err.message,
          status: "error",
          duration: 3000,
        });
      }
    }
  };
  // waiting for approval screen
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // now render the “not allowed” or the real MeetingRoom
  if (canJoin === false) {
    return (
      <>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            onClose();
            navigate("/");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Purchase Required
              </AlertDialogHeader>

              <AlertDialogBody>
                You don&apos;t have access to this meeting. Would you like to
                purchase the course now?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    onClose();
                    navigate("/");
                  }}
                >
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handlePurchase} ml={3}>
                  Purchase
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  }

  // loading state
  if (callingState !== CallingState.JOINED) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const renderLayout = () => {
    if (layout === "grid") return <PaginatedGridLayout />;
    if (layout === "speaker-right")
      return <SpeakerLayout participantsBarPosition="left" />;
    return <SpeakerLayout participantsBarPosition="right" />;
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      {isOwner && <PendingRequestsPanel />}

      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          {renderLayout()}
        </div>
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList
            onClose={() => setShowParticipants(false)}
            // only owners see blocked users
            blockedUsersSearchFn={isOwner ? blockedUsersSearchFn : undefined}
          />
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center flex-wrap gap-5 bg-gray-800 p-4">
        <CustomCallControls onLeave={() => navigate("/")} />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, idx) => (
              <div key={idx}>
                <DropdownMenuItem onClick={() => setLayout(item.toLowerCase())}>
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button onClick={() => setShowParticipants((p) => !p)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {!isPersonal && <EndCallButton />}
      </div>
    </section>
  );
}
