// server.js
import handler from "./api/index.js";
import http from "http";
const server = http.createServer(handler);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Local listening on ${PORT}`));
