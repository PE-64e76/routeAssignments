import { HydratedDocument, PopulateOptions } from "mongoose";
import { INotification, IPaginate, IUser } from "../../common/interfaces";
import { notificationService as fcmService, NotificationService as FCMService, redisService, RedisService } from "../../common/services";
import { NotificationRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exceptions";
import { CreateNotificationBodyDto, NotificationListQueryDto, GetNotificationParamsDto, MarkAsReadParamsDto, UpdateNotificationParamsDto, UpdateNotificationBodyDto, DeleteNotificationParamsDto, DeleteNotificationQueryDto, RestoreNotificationParamsDto } from "./notification.dto";
import { toObjectId } from "../../common/utils/objectId";

export class NotificationService {
    private populate: PopulateOptions[] = [
        { path: "recipients" },
        { path: "createdBy" },
    ];
    private readonly redis: RedisService;
    private readonly fcm: FCMService;
    private readonly notificationRepository: NotificationRepository;
    private readonly userRepository: UserRepository;

    constructor() {
        this.redis = redisService;
        this.fcm = fcmService;
        this.notificationRepository = new NotificationRepository();
        this.userRepository = new UserRepository();
    }

    async createNotification({ title, body, recipients }: CreateNotificationBodyDto, admin: HydratedDocument<IUser>): Promise<INotification> {

        const isBroadcast = !recipients?.length;

        let recipientIds: string[] = recipients || [];
        if (isBroadcast) {
            const allUsers = await this.userRepository.find({ filter: {}, projection: { _id: 1 } });
            recipientIds = allUsers.map(u => u._id.toString());
        } else {
            const matchedUsers = await this.userRepository.find({
                filter: { _id: { $in: recipients } }
            });
            if (matchedUsers.length != recipients?.length) {
                throw new NotFoundException("Fail to find some or all recipient accounts");
            }
        }

        const notification = await this.notificationRepository.createOne({
            data: {
                title,
                body,
                recipients: isBroadcast ? [] : (recipients || []).map(id => toObjectId(id)),
                isBroadcast,
                createdBy: admin._id
            }
        });

        const tokens: string[] = [];
        for (const userId of recipientIds) {
            (await this.redis.getFCMs(userId) || []).forEach(token => tokens.push(token));
        }
        if (tokens.length) {
            await this.fcm.sendNotifications({
                tokens,
                data: { title, body: JSON.stringify({ message: body, notificationId: notification._id }) }
            });
        }

        const populated = await this.notificationRepository.findOne({
            filter: { _id: notification._id },
            options: { populate: this.populate }
        });
        return populated!.toJSON();
    }

    async notificationList({ page, search, size }: NotificationListQueryDto, user: HydratedDocument<IUser>): Promise<IPaginate<INotification>> {
        const notifications = await this.notificationRepository.paginate({
            filter: {
                $or: [{ recipients: user._id }, { isBroadcast: true }],
                ...(search?.length ? { title: { $regex: search, $options: "i" } } : {})
            },
            page,
            size,
            options: {
                populate: this.populate,
                sort: { createdAt: -1 }
            }
        });
        return notifications;
    }

    async getNotification({ notificationId }: GetNotificationParamsDto, user: HydratedDocument<IUser>): Promise<INotification> {
        const notification = await this.notificationRepository.findOne({
            filter: {
                _id: notificationId,
                $or: [{ recipients: user._id }, { isBroadcast: true }]
            },
            options: { populate: this.populate }
        });
        if (!notification) {
            throw new NotFoundException("Fail to find matching notification");
        }
        return notification.toJSON();
    }

    async markAsRead({ notificationId }: MarkAsReadParamsDto, user: HydratedDocument<IUser>): Promise<INotification> {
        const notification = await this.notificationRepository.findOneAndUpdate({
            filter: {
                _id: notificationId,
                $or: [{ recipients: user._id }, { isBroadcast: true }]
            },
            update: {
                $addToSet: { readBy: user._id }
            },
            populate: this.populate
        });
        if (!notification) {
            throw new NotFoundException("Fail to find matching notification");
        }
        return notification.toJSON();
    }

    async updateNotification({ notificationId }: UpdateNotificationParamsDto, { title, body, recipients }: UpdateNotificationBodyDto, admin: HydratedDocument<IUser>): Promise<INotification> {

        if (recipients?.length) {
            const matchedUsers = await this.userRepository.find({
                filter: { _id: { $in: recipients } }
            });
            if (matchedUsers.length != recipients.length) {
                throw new NotFoundException("Fail to find some or all recipient accounts");
            }
        }

        const notification = await this.notificationRepository.findOneAndUpdate({
            filter: { _id: notificationId },
            update: {
                ...(title ? { title } : {}),
                ...(body ? { body } : {}),
                ...(recipients?.length ? { recipients: recipients.map(id => toObjectId(id)), isBroadcast: false } : {}),
                updatedBy: admin._id
            },
            populate: this.populate
        });
        if (!notification) {
            throw new NotFoundException("Fail to find matching notification");
        }
        return notification.toJSON();
    }

    async deleteNotification({ notificationId }: DeleteNotificationParamsDto, { force }: DeleteNotificationQueryDto): Promise<{ deletedCount: number; }> {
        const result = await this.notificationRepository.deleteOne({
            filter: { _id: notificationId },
            force: Boolean(force)
        });
        if (!result.deletedCount) {
            throw new BadRequestException("Fail to delete notification");
        }
        return result;
    }

    async restoreNotification({ notificationId }: RestoreNotificationParamsDto): Promise<INotification> {
        const notification = await this.notificationRepository.findOne({
            filter: { _id: notificationId, paranoid: false, deletedAt: { $exists: true } }
        });
        if (!notification) {
            throw new NotFoundException("Fail to find matching deleted notification to restore");
        }

        await this.notificationRepository.restoreOne({
            filter: { _id: notificationId }
        });

        const restored = await this.notificationRepository.findOne({
            filter: { _id: notificationId },
            options: { populate: this.populate }
        });
        if (!restored) {
            throw new NotFoundException("Fail to find matching notification");
        }
        return restored.toJSON();
    }

}

export const notificationServiceInstance = new NotificationService();
