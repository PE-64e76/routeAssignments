import { z } from "zod";
import { AvailabilityEnum, ReactionEnum } from "../../common/enum";
import { Types } from "mongoose";
import { generalValidationFields, paginationvalidationSchema } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";

export const createPost = {
    body: z.strictObject({
        content: z.string().optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
        tags: z.array(z.string()).optional(),
        availability: z.coerce.number().default(AvailabilityEnum.PUBLIC)
    }).superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "Content is required"
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length != args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ['tags'],
                    message: "Duplicated tag"
                });
            }

            for (const tag of args.tags) {
                if (!Types.ObjectId.isValid(tag)) {
                    ctx.addIssue({
                        code: "custom",
                        path: ['tags'],
                        message: `Invalid tagged objectId ${tag}`
                    });
                }
            }
        }
    })
};

export const updatePost = {
    params: z.strictObject({
        postId: generalValidationFields.id
    }),
    body: z.strictObject({
        content: z.string().optional(),
        removeFiles: z.array(z.string()).optional(),
        removeTags: z.array(z.string()).optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
        tags: z.array(generalValidationFields.id).optional(),
        availability: z.coerce.number().optional()
    }).superRefine((args, ctx) => {
        if (!Object.values(args)?.length) {
            ctx.addIssue({
                code: "custom",
                message: "Insert data to update"
            });
        }
        if (args.tags?.length) {
            const uniqueTags = [...new Set(args.tags)];
            if (uniqueTags.length != args.tags.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ['tags'],
                    message: "Duplicated tag"
                });
            }
        }
    })
};



export const reactPost = {
    params: z.strictObject({
        postId: generalValidationFields.id
    }),
    body: z.strictObject({
        react: z.enum(ReactionEnum)
    })
};

export const reactOnPostGQL = z.strictObject({
    postId: generalValidationFields.id,
    react: z.enum(ReactionEnum)
});

export const unreactPost = {
    params: z.strictObject({
        postId: generalValidationFields.id
    })
};

export const unreactOnPostGQL = z.strictObject({
    postId: generalValidationFields.id
});

export const deletePost = {
    params: z.strictObject({
        postId: generalValidationFields.id
    }),
    query: z.strictObject({
        force: z.coerce.boolean().optional()
    })
};

export const restorePost = {
    params: z.strictObject({
        postId: generalValidationFields.id
    })
};

export const deletePostGQL = z.strictObject({
    postId: generalValidationFields.id,
    force: z.coerce.boolean().optional()
});

export const restorePostGQL = z.strictObject({
    postId: generalValidationFields.id
});

export const profilePosts = {
    params: z.strictObject({
        userId: generalValidationFields.id
    }),
    query: paginationvalidationSchema.query
};

export const profilePostsGQL = z.strictObject({
    userId: generalValidationFields.id,
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
    search: z.string().optional(),
});