import { Center } from "@chakra-ui/react";
import React from "react";
import ReactPlayer from "react-player";
import { useLocation } from "react-router-dom";
// Render a YouTube video player
const VideoPlayer = () => {
  const location = useLocation();
  const { link } = location.state || {};
  console.log(link);
  return (
    <Center w="full" h="100vh">
      <ReactPlayer url={link} playing={true} controls />
    </Center>
  );
};
export default VideoPlayer;
