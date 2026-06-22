import { z } from 'zod';
import { createNotification, notificationList, getNotification, markAsRead, updateNotification, deleteNotification, restoreNotification, createNotificationGQL, notificationListGQL, getNotificationGQL, markAsReadGQL, updateNotificationGQL, deleteNotificationGQL, restoreNotificationGQL } from './notification.validation';

export type CreateNotificationBodyDto = z.infer<typeof createNotification.body>;

export type NotificationListQueryDto = z.infer<typeof notificationList.query>;

export type GetNotificationParamsDto = z.infer<typeof getNotification.params>;

export type MarkAsReadParamsDto = z.infer<typeof markAsRead.params>;

export type UpdateNotificationParamsDto = z.infer<typeof updateNotification.params>;
export type UpdateNotificationBodyDto = z.infer<typeof updateNotification.body>;

export type DeleteNotificationParamsDto = z.infer<typeof deleteNotification.params>;
export type DeleteNotificationQueryDto = z.infer<typeof deleteNotification.query>;

export type RestoreNotificationParamsDto = z.infer<typeof restoreNotification.params>;

export type CreateNotificationArgsDto = z.infer<typeof createNotificationGQL>;
export type NotificationListArgsDto = z.infer<typeof notificationListGQL>;
export type GetNotificationArgsDto = z.infer<typeof getNotificationGQL>;
export type MarkAsReadArgsDto = z.infer<typeof markAsReadGQL>;
export type UpdateNotificationArgsDto = z.infer<typeof updateNotificationGQL>;
export type DeleteNotificationArgsDto = z.infer<typeof deleteNotificationGQL>;
export type RestoreNotificationArgsDto = z.infer<typeof restoreNotificationGQL>;
