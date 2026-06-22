import { HydratedDocument, Types } from "mongoose";
import { ChatRepository, UserRepository } from "../../DB/repository";
import { IChat, IUser } from "../../common/interfaces";
import { toObjectId } from "../../common/utils/objectId";
import { NotFoundException } from "../../common/exceptions";
import { ChatEnum } from "../../common/enum";
import { s3Service, S3Service } from "../../common/services";
import { randomUUID } from "node:crypto";

export class ChatService {
    private chatRepository: ChatRepository;
    private userRepository: UserRepository;
    private s3Service: S3Service;
    constructor() {
        this.chatRepository = new ChatRepository();
        this.userRepository = new UserRepository();
        this.s3Service = s3Service;
    }
    sayHi = () => {
        return "Done";
    };

    async getChat(participantsId: string, { page, size }: { page?: string, size?: string; }, user: HydratedDocument<IUser>): Promise<IChat> {
        const chat = await this.chatRepository.findOneChat({
            filter: {
                participants: { $all: [user._id, toObjectId(participantsId)] }
            },
            options: {
                populate: [{ path: 'participants' }]
            },
            page,
            size
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching conversation");
        }
        return chat.toJSON();
    }

    async sendMessage({ content, sendTo }: { content: string, sendTo: string; }, user: HydratedDocument<IUser>): Promise<void> {
        let chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                participants: { $all: [user._id, toObjectId(sendTo)] },
                type: ChatEnum.ovo
            },
            update: {
                $addToSet: {
                    messages: {
                        content,
                        createdBy: user._id
                    }
                }
            }
        });
        if (!chat) {
            chat = await this.chatRepository.createOne({
                data: {
                    participants: [user._id, toObjectId(sendTo)],
                    createdBy: user._id,
                    type: ChatEnum.ovo,
                    messages: [{
                        content,
                        createdBy: user._id
                    }]
                }
            });
        }
    }

    async sendGroupMessage({ content, groupId }: { content: string, groupId: string; }, user: HydratedDocument<IUser>): Promise<string> {
        let chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(groupId),
                participants: { $all: [user._id] },
                type: ChatEnum.ovm
            },
            update: {
                $addToSet: {
                    messages: {
                        content,
                        createdBy: user._id
                    }
                }
            }
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching group");
        }
        return chat.roomId;
    }

    async createGroup({ participantsIds = [], group }: { participantsIds: string[] | Types.ObjectId[], group: string; }, user: HydratedDocument<IUser>, file?: Express.Multer.File): Promise<IChat> {
        participantsIds = participantsIds.map(ele => { return toObjectId(ele as string); });
        const users = await this.userRepository.find({ filter: { _id: { $in: participantsIds }, friends: { $in: [user._id] } } });
        if (users.length != participantsIds.length) {
            throw new NotFoundException("Fail to find all participants");
        }
        let group_image!: string;
        const roomId = randomUUID();
        const path = `Chat/group/${roomId}`;
        if (file) {
            group_image = await this.s3Service.uploadAsset({
                path,
                file
            });
        }
        const chattingGroup = await this.chatRepository.createOne({
            data: {
                participants: [...participantsIds, user._id],
                createdBy: user._id,
                messages: [],
                type: ChatEnum.ovm,
                group,
                roomId,
                group_image
            }
        });
        return chattingGroup.toJSON();
    }

    async getGroupChat(groupId: string, { page, size }: { page?: string, size?: string; }, user: HydratedDocument<IUser>): Promise<IChat> {
        const chat = await this.chatRepository.findOneChat({
            filter: {
                _id: toObjectId(groupId),
                participants: { $in: [user._id] },
                type: ChatEnum.ovm
            },
            options: {
                populate: [{ path: 'participants' }, { path: "messages.createdBy" }]
            },
            page,
            size
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching conversation");
        }
        return chat.toJSON();
    }

    // ─── Tags ────────────────────────────────────────────────────────────────

    async tagMessage({ chatId, messageId, taggedUserId }: { chatId: string, messageId: string, taggedUserId: string; }, user: HydratedDocument<IUser>): Promise<void> {
        const chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(chatId),
                participants: { $all: [user._id, toObjectId(taggedUserId)] },
                type: ChatEnum.ovo,
                "messages._id": toObjectId(messageId)
            },
            update: {
                $addToSet: {
                    "messages.$.tags": toObjectId(taggedUserId)
                }
            }
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching message or conversation");
        }
    }

    async tagGroupMessage({ groupId, messageId, taggedUserId }: { groupId: string, messageId: string, taggedUserId: string; }, user: HydratedDocument<IUser>): Promise<string> {
        const chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(groupId),
                participants: { $all: [user._id, toObjectId(taggedUserId)] },
                type: ChatEnum.ovm,
                "messages._id": toObjectId(messageId)
            },
            update: {
                $addToSet: {
                    "messages.$.tags": toObjectId(taggedUserId)
                }
            }
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching message or group");
        }
        return chat.roomId;
    }

    // ─── Reactions ───────────────────────────────────────────────────────────

    async reactMessage({ chatId, messageId }: { chatId: string, messageId: string; }, user: HydratedDocument<IUser>): Promise<void> {
        const chat = await this.chatRepository.findOne({
            filter: {
                _id: toObjectId(chatId),
                participants: { $in: [user._id] },
                type: ChatEnum.ovo,
                "messages._id": toObjectId(messageId)
            }
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching message or conversation");
        }

        const message = chat.messages.find(msg => msg._id?.toString() === messageId);
        const alreadyLiked = (message?.likes as Types.ObjectId[])?.some(id => id.toString() === user._id.toString());

        await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(chatId),
                "messages._id": toObjectId(messageId)
            },
            update: alreadyLiked
                ? { $pull: { "messages.$.likes": user._id } }
                : { $addToSet: { "messages.$.likes": user._id } }
        });
    }

    async reactGroupMessage({ groupId, messageId }: { groupId: string, messageId: string; }, user: HydratedDocument<IUser>): Promise<string> {
        const chat = await this.chatRepository.findOne({
            filter: {
                _id: toObjectId(groupId),
                participants: { $in: [user._id] },
                type: ChatEnum.ovm,
                "messages._id": toObjectId(messageId)
            }
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching message or group");
        }

        const message = chat.messages.find(msg => msg._id?.toString() === messageId);
        const alreadyLiked = (message?.likes as Types.ObjectId[])?.some(id => id.toString() === user._id.toString());

        await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(groupId),
                "messages._id": toObjectId(messageId)
            },
            update: alreadyLiked
                ? { $pull: { "messages.$.likes": user._id } }
                : { $addToSet: { "messages.$.likes": user._id } }
        });

        return chat.roomId;
    }

    // ─── Attachments ─────────────────────────────────────────────────────────

    async sendMessageWithAttachments({ content, sendTo }: { content?: string, sendTo: string; }, user: HydratedDocument<IUser>, files: Express.Multer.File[]): Promise<void> {
        const path = `Chat/attachments/${user._id}`;
        const attachments = await this.s3Service.uploadAssets({ files, path });

        let chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                participants: { $all: [user._id, toObjectId(sendTo)] },
                type: ChatEnum.ovo
            },
            update: {
                $addToSet: {
                    messages: {
                        content,
                        attachments,
                        createdBy: user._id
                    }
                }
            }
        });
        if (!chat) {
            chat = await this.chatRepository.createOne({
                data: {
                    participants: [user._id, toObjectId(sendTo)],
                    createdBy: user._id,
                    type: ChatEnum.ovo,
                    messages: [{
                        content,
                        attachments,
                        createdBy: user._id
                    }]
                }
            });
        }
    }

    async sendGroupMessageWithAttachments({ content, groupId }: { content?: string, groupId: string; }, user: HydratedDocument<IUser>, files: Express.Multer.File[]): Promise<string> {
        const path = `Chat/attachments/group/${groupId}`;
        const attachments = await this.s3Service.uploadAssets({ files, path });

        const chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: toObjectId(groupId),
                participants: { $all: [user._id] },
                type: ChatEnum.ovm
            },
            update: {
                $addToSet: {
                    messages: {
                        content,
                        attachments,
                        createdBy: user._id
                    }
                }
            }
        });
        if (!chat) {
            throw new NotFoundException("Fail to find matching group");
        }
        return chat.roomId;
    }
}
export const chatService = new ChatService();
