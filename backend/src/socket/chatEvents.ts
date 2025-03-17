import { Server, Socket } from "socket.io";
import { saveMessageRepo } from '../repositories/messageRepo';
import { Message } from '../types/message';
import redis from '../config/redis';

const chatEvents = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        console.log("A user connected");

        socket.on("userConnected", async (userId: string) => {
            socket.data.userId = userId;
            // Add user to Redis set of online users
            await redis.sadd('online_users', userId);
            // Broadcast to all clients
            io.emit("update-online-status", { userId, isOnline: true });
        });

        socket.on("disconnect", async () => {
            const userId = socket.data.userId;
            if (userId) {
                // Remove user from Redis set
                await redis.srem('online_users', userId);
                // Broadcast to all clients
                io.emit("update-online-status", { userId, isOnline: false });
            }
            console.log("User disconnected");
            // Notify other users in the chat room
            socket.rooms.forEach((room) => {
                socket.to(room).emit("userDisconnected", `User has left the chat: ${room}`);
            });
        });

        socket.on("joinChat", (chatId: string) => {
            socket.join(chatId);
            console.log(`User joined chat: ${chatId}`);
        });

        socket.on("typing", (chatId: string, userId: string, username: string) => {
            socket.to(chatId).emit("userTyping", userId, username);
        });

        socket.on("stopTyping", (chatId: string, userId: string) => {
            socket.to(chatId).emit("userStoppedTyping", userId);
        });

        socket.on("sendMessage", async (chatId: string, userId: string, message: string) => {
            console.log("Message Received", { message, userId, chatId });
            // Save message and get complete message object
            const savedMessage: Message = await saveMessageRepo(chatId, userId, message);
            // Emit complete message object instead of just the message text
            io.to(chatId).emit("receiveMessage", savedMessage);
        });

        socket.on("checkOnlineStatus", async (userIds: string[]) => {
            const statuses = await Promise.all(
                userIds.map(async (userId) => ({
                    userId,
                    isOnline: await redis.sismember('online_users', userId)
                }))
            );
            socket.emit("online-statuses", statuses);
        });
    });
};

export default chatEvents;
