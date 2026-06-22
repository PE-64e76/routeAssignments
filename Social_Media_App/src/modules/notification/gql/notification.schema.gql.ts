import * as NotificationGQLTypes from './notification.types.gql';
import * as NotificationGQLArgs from './notification.args.gql';
import { notificationResolver, NotificationResolver } from './notification.resolver';

export class NotificationGQLSchema {
    private notificationResolver: NotificationResolver;
    constructor() {
        this.notificationResolver = notificationResolver;
    }
    registerQuery() {
        return {
            notificationList: {
                type: NotificationGQLTypes.notificationList,
                args: NotificationGQLArgs.notificationList,
                resolve: this.notificationResolver.notificationList,
            },
            getNotification: {
                type: NotificationGQLTypes.oneNotification,
                args: NotificationGQLArgs.getNotification,
                resolve: this.notificationResolver.getNotification,
            }
        };
    }

    registerMutation() {
        return {
            createNotification: {
                type: NotificationGQLTypes.oneNotification,
                args: NotificationGQLArgs.createNotification,
                resolve: this.notificationResolver.createNotification
            },
            markAsRead: {
                type: NotificationGQLTypes.oneNotification,
                args: NotificationGQLArgs.markAsRead,
                resolve: this.notificationResolver.markAsRead
            },
            updateNotification: {
                type: NotificationGQLTypes.oneNotification,
                args: NotificationGQLArgs.updateNotification,
                resolve: this.notificationResolver.updateNotification
            },
            deleteNotification: {
                type: NotificationGQLTypes.deleteNotification,
                args: NotificationGQLArgs.deleteNotification,
                resolve: this.notificationResolver.deleteNotification
            },
            restoreNotification: {
                type: NotificationGQLTypes.oneNotification,
                args: NotificationGQLArgs.restoreNotification,
                resolve: this.notificationResolver.restoreNotification
            }
        };
    }
}

export const notificationGQLSchema = new NotificationGQLSchema();
