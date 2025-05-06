import { StreamClient } from "@stream-io/node-sdk";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_SECRET_KEY;
const client = new StreamClient(apiKey, secret, { timeout: 3000 });

// Export the client correctly
export default client;
