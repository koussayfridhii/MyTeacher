// Only uses PUBLIC key; never expose your PRIVATE key here
import { StreamVideo } from "@stream-io/video-react-sdk";
export const streamClient = new StreamVideo(
  import.meta.env.VITE_STREAM_API_KEY
);
