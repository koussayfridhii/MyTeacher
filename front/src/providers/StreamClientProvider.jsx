import { Center, Spinner } from "@chakra-ui/react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// anywhere in your frontend code:
async function fetchStreamToken() {
  const jwt = localStorage.getItem("token");
  if (!jwt) throw new Error("Not authenticated");

  const res = await axios.get(import.meta.env.VITE_API_URL + "/stream/token", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const { token: streamToken } = res.data;
  return streamToken;
}

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const StreamVideoProvider = ({ children }) => {
  const [videoClient, setVideoClient] = useState();
  const { user, isLoggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/signin");
      return;
    }
    if (!apiKey) throw new Error("Missing Stream API key");

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user?._id,
        name: `${user?.firstName} ${user?.lastName}`,
        image:
          user?.profileImage ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      },
      tokenProvider: fetchStreamToken,
    });

    setVideoClient(client);
  }, [user, isLoggedIn]);

  if (!videoClient)
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
