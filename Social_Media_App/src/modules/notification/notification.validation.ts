import { z } from "zod";
import { generalValidationFields, paginationvalidationSchema } from "../../common/validation";

export const createNotification = {
    body: z.strictObject({
        title: z.string().min(1),
        body: z.string().min(1),
        recipients: z.array(generalValidationFields.id).optional(),
    }).superRefine((args, ctx) => {
        if (args.recipients?.length) {
            const uniqueRecipients = [...new Set(args.recipients)];
            if (uniqueRecipients.length != args.recipients.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ['recipients'],
                    message: "Duplicated recipient"
                });
            }
        }
    })
};

export const notificationList = {
    query: paginationvalidationSchema.query
};

export const getNotification = {
    params: z.strictObject({
        notificationId: generalValidationFields.id
    })
};

export const markAsRead = {
    params: z.strictObject({
        notificationId: generalValidationFields.id
    })
};

export const updateNotification = {
    params: z.strictObject({
        notificationId: generalValidationFields.id
    }),
    body: z.strictObject({
        title: z.string().min(1).optional(),
        body: z.string().min(1).optional(),
        recipients: z.array(generalValidationFields.id).optional(),
    }).superRefine((args, ctx) => {
        if (!Object.values(args)?.length) {
            ctx.addIssue({
                code: "custom",
                message: "Insert data to update"
            });
        }
    })
};

export const deleteNotification = {
    params: z.strictObject({
        notificationId: generalValidationFields.id
    }),
    query: z.strictObject({
        force: z.coerce.boolean().optional()
    })
};

export const restoreNotification = {
    params: z.strictObject({
        notificationId: generalValidationFields.id
    })
};

export const createNotificationGQL = z.strictObject({
    title: z.string().min(1),
    body: z.string().min(1),
    recipients: z.array(generalValidationFields.id).optional(),
});

export const notificationListGQL = z.strictObject({
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
    search: z.string().optional(),
});

export const getNotificationGQL = z.strictObject({
    notificationId: generalValidationFields.id
});

export const markAsReadGQL = z.strictObject({
    notificationId: generalValidationFields.id
});

export const updateNotificationGQL = z.strictObject({
    notificationId: generalValidationFields.id,
    title: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    recipients: z.array(generalValidationFields.id).optional(),
});

export const deleteNotificationGQL = z.strictObject({
    notificationId: generalValidationFields.id,
    force: z.coerce.boolean().optional(),
});

export const restoreNotificationGQL = z.strictObject({
    notificationId: generalValidationFields.id
});
