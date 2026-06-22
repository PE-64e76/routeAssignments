import { model, models, Schema, Types } from "mongoose";
import { IStory } from "../../common/interfaces";

const STORY_LIFETIME_SECONDS = 24 * 60 * 60; // 24 hours

const storySchema = new Schema<IStory>({
    content: {
        type: String,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },

    viewers: [{ type: Types.ObjectId, ref: "User" }],

    createdBy: { type: Types.ObjectId, ref: "User", required: true },

    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + STORY_LIFETIME_SECONDS * 1000)
    },

}, {
    timestamps: { createdAt: true, updatedAt: false },
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
});

// TTL index: MongoDB automatically deletes a story once its expiresAt timestamp is reached.
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Defense in depth: hide stories that have already logically expired even during
// the short window before MongoDB's background TTL sweep physically removes them.
storySchema.pre(["find", "findOne", "countDocuments"], function () {
    this.setQuery({
        ...this.getQuery(),
        expiresAt: { $gt: new Date() }
    });
});

export const StoryModel = models.Story || model<IStory>("Story", storySchema);
StoryModel.syncIndexes();
