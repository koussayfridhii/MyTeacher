import React, { useState } from "react";
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
import { Center, Spinner, Text } from "@chakra-ui/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function MeetingRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOwner = useIsMeetingOwner();
  const isPersonal = new URLSearchParams(location.search).get("personal");
  const [layout, setLayout] = useState("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);

  // extract hooks including the blockedUsersSearchFn
  const { useCallCallingState, blockedUsersSearchFn } = useCallStateHooks();
  const callingState = useCallCallingState();

  // waiting for approval screen
  if (callingState === CallingState.ENTERING) {
    return (
      <Center h="100vh">
        <Text color="white">Waiting for host approval…</Text>
      </Center>
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
