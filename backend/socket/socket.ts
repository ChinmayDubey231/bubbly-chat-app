import dotenv from "dotenv";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerUserEvents } from "./userEvents.ts";
import { resiterChatEvents } from "./chatEvents.ts";
import Conversation from "../modals/Conversation.ts";

dotenv.config();

export function initializeSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  //auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No Token Provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: Invalid Token"));
        }

        //attach user data to socket
        let userData = decoded.user;
        socket.data = userData;
        socket.data.userId = userData.id;
        next();
      },
    );
  });

  //when socket connects
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User Connected: ${userId}, username: ${socket.data.name}`);

    //register events
    resiterChatEvents(io, socket);
    registerUserEvents(io, socket);

    //join all conversations the user is part of
    try {
      const conversation = await Conversation.find({
        participants: userId,
      }).select("_id");

      conversation.forEach((conversation) => {
        socket.join(conversation._id.toString());
      });
    } catch (error) {
      console.log("Error joining conversation: ", error);
    }

    socket.on("disconnect", () => {
      //user logs out
      console.log(`User Disconnected: ${userId}`);
    });
  });

  return io;
}
