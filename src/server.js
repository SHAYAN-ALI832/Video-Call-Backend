import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import router from './Routes/Auth_Routes.js';
import { initSocket } from './lib/Sockets.js';
import { connectDB } from './lib/Db.js';
import { getUsers } from './Controllers/usercontrollers.js';
import cookieParser from "cookie-parser";



dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cookieParser());
// ✅ Enable CORS for REST API
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,              // allow cookies/auth headers if needed
}));

app.use(express.json());

// Routes
app.use('/api/auth', router);

// Create HTTP server
const server = http.createServer(app);

// ✅ Enable CORS for WebSockets
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO logic
initSocket(server);

// Start server
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  connectDB();
});
