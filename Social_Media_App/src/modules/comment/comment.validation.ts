import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";
import { paginationvalidationSchema } from "../../common/validation";
import { ReactionEnum } from "../../common/enum";

export const createComment = {
    params: z.strictObject({
        postId: generalValidationFields.id
    }),
    body: z.strictObject({
        content: z.string().optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
        tags: z.array(generalValidationFields.id).optional(),
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
        }
    })
};

export const replayOnComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    }),
    body: createComment.body
};

export const commentList = {
    params: z.strictObject({
        postId: generalValidationFields.id
    }),
    query: paginationvalidationSchema.query
};

export const getComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    })
};

export const updateComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    }),
    body: z.strictObject({
        content: z.string().optional(),
        removeFiles: z.array(z.string()).optional(),
        removeTags: z.array(z.string()).optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
        tags: z.array(generalValidationFields.id).optional(),
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

export const deleteComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    }),
    query: z.strictObject({
        force: z.coerce.boolean().optional()
    })
};

export const restoreComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    })
};

export const reactComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    }),
    body: z.strictObject({
        react: z.enum(ReactionEnum)
    })
};

export const unreactComment = {
    params: z.strictObject({
        postId: generalValidationFields.id,
        commentId: generalValidationFields.id
    })
};

export const commentListGQL = z.strictObject({
    postId: generalValidationFields.id,
    page: z.coerce.number().optional(),
    size: z.coerce.number().optional(),
    search: z.string().optional(),
});

export const getCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
});

export const createCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    content: z.string().optional(),
    tags: z.array(generalValidationFields.id).optional(),
}).superRefine((args, ctx) => {
    if (!args.content) {
        ctx.addIssue({
            code: "custom",
            path: ['content'],
            message: "Content is required"
        });
    }
});

export const replayOnCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
    content: z.string().optional(),
    tags: z.array(generalValidationFields.id).optional(),
}).superRefine((args, ctx) => {
    if (!args.content) {
        ctx.addIssue({
            code: "custom",
            path: ['content'],
            message: "Content is required"
        });
    }
});

export const updateCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
    content: z.string().optional(),
    tags: z.array(generalValidationFields.id).optional(),
    removeTags: z.array(generalValidationFields.id).optional(),
});

export const deleteCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
    force: z.coerce.boolean().optional(),
});

export const restoreCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
});

export const reactCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
    react: z.enum(ReactionEnum)
});

export const unreactCommentGQL = z.strictObject({
    postId: generalValidationFields.id,
    commentId: generalValidationFields.id,
});

