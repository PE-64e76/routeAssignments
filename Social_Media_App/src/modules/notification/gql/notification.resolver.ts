import { notificationServiceInstance as notificationService, NotificationService } from "../notification.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLAuthorization, GQLValidation } from "../../../middleware";
import { endpoint } from "../notification.authorization";
import { createNotificationGQL, notificationListGQL, getNotificationGQL, markAsReadGQL, updateNotificationGQL, deleteNotificationGQL, restoreNotificationGQL } from "../notification.validation";
import { CreateNotificationArgsDto, NotificationListArgsDto, GetNotificationArgsDto, MarkAsReadArgsDto, UpdateNotificationArgsDto, DeleteNotificationArgsDto, RestoreNotificationArgsDto } from "../notification.dto";

export class NotificationResolver {
    private notificationService: NotificationService;
    constructor() {
        this.notificationService = notificationService;
    }

    createNotification = async (parent: unknown, args: CreateNotificationArgsDto, { user }: IAuthUser) => {
        await GQLAuthorization(endpoint.create, user);
        await GQLValidation<CreateNotificationArgsDto>(createNotificationGQL, args);
        const data = await this.notificationService.createNotification(args, user);
        return { message: "Done", data };
    };

    notificationList = async (parent: unknown, args: NotificationListArgsDto, { user }: IAuthUser) => {
        await GQLValidation<NotificationListArgsDto>(notificationListGQL, args);
        const data = await this.notificationService.notificationList(args, user);
        return { message: "Done", data };
    };

    getNotification = async (parent: unknown, args: GetNotificationArgsDto, { user }: IAuthUser) => {
        await GQLValidation<GetNotificationArgsDto>(getNotificationGQL, args);
        const data = await this.notificationService.getNotification(args, user);
        return { message: "Done", data };
    };

    markAsRead = async (parent: unknown, args: MarkAsReadArgsDto, { user }: IAuthUser) => {
        await GQLValidation<MarkAsReadArgsDto>(markAsReadGQL, args);
        const data = await this.notificationService.markAsRead(args, user);
        return { message: "Done", data };
    };

    updateNotification = async (parent: unknown, args: UpdateNotificationArgsDto, { user }: IAuthUser) => {
        await GQLAuthorization(endpoint.manageAny, user);
        await GQLValidation<UpdateNotificationArgsDto>(updateNotificationGQL, args);
        const { notificationId, ...body } = args;
        const data = await this.notificationService.updateNotification({ notificationId }, body, user);
        return { message: "Done", data };
    };

    deleteNotification = async (parent: unknown, args: DeleteNotificationArgsDto, { user }: IAuthUser) => {
        await GQLAuthorization(endpoint.manageAny, user);
        await GQLValidation<DeleteNotificationArgsDto>(deleteNotificationGQL, args);
        const { notificationId, force } = args;
        const data = await this.notificationService.deleteNotification({ notificationId }, { force });
        return { message: "Done", data };
    };

    restoreNotification = async (parent: unknown, args: RestoreNotificationArgsDto, { user }: IAuthUser) => {
        await GQLAuthorization(endpoint.manageAny, user);
        await GQLValidation<RestoreNotificationArgsDto>(restoreNotificationGQL, args);
        const data = await this.notificationService.restoreNotification(args);
        return { message: "Done", data };
    };
}
export const notificationResolver = new NotificationResolver();
