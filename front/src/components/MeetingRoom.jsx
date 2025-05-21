import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
} from "@stream-io/video-react-sdk";
import { Users, LayoutList } from "lucide-react";

import PendingRequestsPanel from "./PendingRequestsPanel";
import CustomCallControls from "./CustomCallControls";
import EndCallButton from "./EndCallButton";
import { cn } from "../utils/utils";
import { Center, Spinner, useToast } from "@chakra-ui/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import axios from "axios";
import { attendClass, login as loginAction } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

const baseURL = import.meta.env.VITE_API_URL;

export default function MeetingRoom() {
  const [loading, setLoading] = useState(true);
  const [canJoin, setCanJoin] = useState(false);
  const [layout, setLayout] = useState("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");
  const { user, wallet } = useSelector((state) => state.user);
  const isPersonal = new URLSearchParams(location.search).get("personal");

  // Video call control hooks
  const { join, leave } = useCall();

  // Check permissions and points on mount or when class changes
  useEffect(() => {
    const checkUser = async () => {
      if (user.role !== "student") {
        setCanJoin(true);
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.post(
          `${baseURL}/users/push-class`,
          { classId: location.pathname.replace("/meeting/", "") },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        dispatch(
          attendClass({
            attendedClasses: data.attendedClasses,
            balance: data.walletBalance || wallet.balance,
          })
        );
        setCanJoin(true);
        setLoading(false);
      } catch (err) {
        console.log(err);
        if (err.response?.status === 400) {
          toast({
            title: "Not enough points",
            status: "warning",
            duration: 4000,
          });
          const [profileRes, walletRes] = await Promise.all([
            axios.get(`${baseURL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${baseURL}/wallet`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          dispatch(
            loginAction({ user: profileRes.data.user, ...walletRes.data })
          );
        } else if (err.response?.status === 403) {
          toast({
            title: "You are not enrolled in this class.",
            status: "error",
            duration: 3000,
          });
        } else {
          toast({ title: "Failed to join", status: "error", duration: 3000 });
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [location.pathname]);

  // Join/leave video call when ready
  useEffect(() => {
    if (!loading && canJoin) {
      join();
    }
    return () => {
      if (canJoin) leave();
    };
  }, [loading, canJoin, join, leave]);

  const handleLeave = async () => {
    await leave();
    navigate("/");
  };

  if (loading || !canJoin) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const renderLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          {renderLayout()}
        </div>
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center flex-wrap gap-5 bg-gray-800 p-4">
        <CustomCallControls onLeave={handleLeave} />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {[
              { label: "Grid", value: "grid" },
              { label: "Speaker-Left", value: "speaker-left" },
              { label: "Speaker-Right", value: "speaker-right" },
            ].map((item) => (
              <div key={item.value}>
                <DropdownMenuItem onClick={() => setLayout(item.value)}>
                  {item.label}
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

        {!isPersonal && <EndCallButton role={user.role} />}
      </div>
    </section>
  );
}
