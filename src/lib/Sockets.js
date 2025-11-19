import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; 
import cookie from "cookie";
import dotenv from 'dotenv'
dotenv.config(); 
let io;
const authenticateSocket = (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie);
    console.log("Socket cookies:", cookies);
    const token = cookies.jwt;
    if (!token) {
      console.log("No auth token found in socket connection");
      return next(new Error("Authentication error - no token"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user from socket:", decoded);

    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.userName = decoded.name;

    next();
  } catch (error) {
    console.log("Socket authentication failed:", error.message);
    next(new Error("Authentication error"));
  }
};


export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("New authenticated client connected:");
    console.log("- Socket ID:", socket.id);
    console.log("- User ID:", socket.userId);
    console.log("- User Email:", socket.userEmail);
    console.log("- User Name:", socket.userName);
    socket.on("create-room", () => {
      const roomId = uuidv4();
      socket.join(roomId);
      socket.emit("room-created", { roomId });
      console.log(`Room created: ${roomId} by user: ${socket.userEmail}`);
    });
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", { 
        socketId: socket.id,
        userId: socket.userId,
        userEmail: socket.userEmail,
        userName: socket.userName
      });
      console.log(`User ${socket.userEmail} (${socket.id}) joined room: ${roomId}`);
    });

    // ✅ Enhanced messaging with user info
    socket.on("sendMessage", (data) => {
      console.log("Message sent by:");
      console.log("- User ID:", socket.userId);
      console.log("- User Email:", socket.userEmail);
      console.log("- User Name:", socket.userName);
      console.log("- Message:", data.message);
      
      const messageWithUser = {
        ...data,
        sender: {
          id: socket.userId,
          email: socket.userEmail,
          name: socket.userName,
          socketId: socket.id
        },
        timestamp: new Date().toISOString()
      };
      
      // Send to all clients in the room (or broadcast)
      if (data.roomId) {
        socket.to(data.roomId).emit("receiveMessage", messageWithUser);
      } else {
        socket.broadcast.emit("receiveMessage", messageWithUser);
      }
    });

    // ✅ Video call signaling with user info
    socket.on("call-user", ({ roomId, offer }) => {
      console.log(`Video call initiated by ${socket.userEmail} in room ${roomId}`);
      socket.to(roomId).emit("call-made", { 
        from: socket.id,
        fromUser: {
          id: socket.userId,
          email: socket.userEmail,
          name: socket.userName
        },
        offer 
      });
    });

    socket.on("make-answer", ({ roomId, answer }) => {
      console.log(`Video call answered by ${socket.userEmail} in room ${roomId}`);
      socket.to(roomId).emit("answer-made", { 
        from: socket.id,
        fromUser: {
          id: socket.userId,
          email: socket.userEmail,
          name: socket.userName
        },
        answer 
      });
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", { 
        from: socket.id,
        fromUser: {
          id: socket.userId,
          email: socket.userEmail,
          name: socket.userName
        },
        candidate 
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:");
      console.log("- Socket ID:", socket.id);
      console.log("- User Email:", socket.userEmail);
      console.log("- User Name:", socket.userName);
    });
  });
};

export const getIO = () => io;