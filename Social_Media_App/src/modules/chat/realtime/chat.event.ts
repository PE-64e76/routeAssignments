import { Server } from "socket.io";
import { IAuthSocket } from "../../../common/types/express.types";
import { SocketValidation } from "../../../middleware";
import { chatService, ChatService } from "../chat.service";
import * as validators from "../chat.validation";
import { redisService, RedisService } from "../../../common/services";
export class ChatEvent {
    private redisService: RedisService;
    private chatService: ChatService;
    constructor() {
        this.redisService = redisService;
        this.chatService = chatService;
    }
    sayHi = (socket: IAuthSocket) => {
        return socket.on("sayHi", async (data: { name: string; }) => {
            try {
                await SocketValidation<{ name: string; }>(validators.sayHi, data);
                console.log({ data });
                const result = this.chatService.sayHi();
                socket.emit("sayHi", result);
            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };

    sendMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("sendMessage", async ({ content, sendTo }: { content: string, sendTo: string; }) => {
            try {
                console.log({ content, sendTo });
                await this.chatService.sendMessage({ content, sendTo }, socket.data.user);
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successMessage", { content, sendTo });
                const receiverSocketIds = await this.redisService.getSockets(sendTo);
                if (receiverSocketIds.length) {
                    socket.to(receiverSocketIds).emit("newMessage", { content, from: socket.data.user });
                }
            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };

    sendGroupMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("sendGroupMessage", async ({ content, groupId }: { content: string, groupId: string; }) => {
            try {
                console.log({ content, groupId });
                const roomId = await this.chatService.sendGroupMessage({ content, groupId }, socket.data.user);
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successMessage", { content, sendTo: groupId });
                socket.to(roomId).emit("newMessage", { content, groupId });

            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };

    join_room = (socket: IAuthSocket, io: Server) => {
        return socket.on("join_room", async ({ roomId }: { roomId: string; }) => {
            try {
                socket.join(roomId);
            } catch (error) {
                console.log({ error });

                socket.emit("custom_error", error);
            }
        });
    };

    // ─── Tags ────────────────────────────────────────────────────────────────

    tagMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("tagMessage", async (data: { chatId: string, messageId: string, taggedUserId: string; }) => {
            try {
                await SocketValidation<{ chatId: string, messageId: string, taggedUserId: string; }>(validators.tagMessage, data);
                await this.chatService.tagMessage(data, socket.data.user);
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successTag", { messageId: data.messageId, taggedUserId: data.taggedUserId });
                const receiverSocketIds = await this.redisService.getSockets(data.taggedUserId);
                if (receiverSocketIds.length) {
                    socket.to(receiverSocketIds).emit("newTag", { messageId: data.messageId, from: socket.data.user });
                }
            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };

    tagGroupMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("tagGroupMessage", async (data: { groupId: string, messageId: string, taggedUserId: string; }) => {
            try {
                await SocketValidation<{ groupId: string, messageId: string, taggedUserId: string; }>(validators.tagGroupMessage, data);
                const roomId = await this.chatService.tagGroupMessage(data, socket.data.user);
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successTag", { messageId: data.messageId, taggedUserId: data.taggedUserId });
                const receiverSocketIds = await this.redisService.getSockets(data.taggedUserId);
                if (receiverSocketIds.length) {
                    socket.to(receiverSocketIds).emit("newTag", { messageId: data.messageId, groupId: data.groupId, from: socket.data.user });
                }
                socket.to(roomId).emit("messageTagged", { messageId: data.messageId, taggedUserId: data.taggedUserId });
            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };

    // ─── Reactions ───────────────────────────────────────────────────────────

    reactMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("reactMessage", async (data: { chatId: string, messageId: string; }) => {
            try {
                await SocketValidation<{ chatId: string, messageId: string; }>(validators.reactMessage, data);
                await this.chatService.reactMessage(data, socket.data.user);
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successReact", { messageId: data.messageId });
                const chatSocketIds = await this.redisService.getSockets(data.chatId);
                if (chatSocketIds.length) {
                    socket.to(chatSocketIds).emit("newReaction", { messageId: data.messageId, from: socket.data.user });
                }
            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };

    reactGroupMessage = (socket: IAuthSocket, io: Server) => {
        return socket.on("reactGroupMessage", async (data: { groupId: string, messageId: string; }) => {
            try {
                await SocketValidation<{ groupId: string, messageId: string; }>(validators.reactGroupMessage, data);
                const roomId = await this.chatService.reactGroupMessage(data, socket.data.user);
                io.to(await this.redisService.getSockets(socket.data.user._id)).emit("successReact", { messageId: data.messageId });
                socket.to(roomId).emit("newReaction", { messageId: data.messageId, from: socket.data.user });
            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    };
}
export const chatEvent = new ChatEvent();
