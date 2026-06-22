import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import { fileFieldValidation } from "../../common/utils/multer";

export const createStory = {
    body: z.strictObject({
        content: z.string().optional(),
        files: z.array(generalValidationFields.file(fileFieldValidation.image)).optional(),
    }).superRefine((args, ctx) => {
        if (!args.files?.length && !args.content) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: "Content is required"
            });
        }
    })
};

export const getUserStories = {
    params: z.strictObject({
        userId: generalValidationFields.id
    })
};

export const getStory = {
    params: z.strictObject({
        storyId: generalValidationFields.id
    })
};

export const viewStory = {
    params: z.strictObject({
        storyId: generalValidationFields.id
    })
};

export const deleteStory = {
    params: z.strictObject({
        storyId: generalValidationFields.id
    })
};

export const getUserStoriesGQL = z.strictObject({
    userId: generalValidationFields.id
});

export const getStoryGQL = z.strictObject({
    storyId: generalValidationFields.id
});

export const viewStoryGQL = z.strictObject({
    storyId: generalValidationFields.id
});

export const deleteStoryGQL = z.strictObject({
    storyId: generalValidationFields.id
});
