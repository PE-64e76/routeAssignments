import { z } from "zod";


export const sayHi = z.strictObject({
    name: z.string().min(2)
});

export const tagMessage = z.strictObject({
    chatId: z.string().min(1),
    messageId: z.string().min(1),
    taggedUserId: z.string().min(1),
});

export const tagGroupMessage = z.strictObject({
    groupId: z.string().min(1),
    messageId: z.string().min(1),
    taggedUserId: z.string().min(1),
});

export const reactMessage = z.strictObject({
    chatId: z.string().min(1),
    messageId: z.string().min(1),
});

export const reactGroupMessage = z.strictObject({
    groupId: z.string().min(1),
    messageId: z.string().min(1),
});
