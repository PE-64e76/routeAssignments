import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { AvailabilityEnum } from "../../common/enum";
import { IPost } from "../../common/interfaces";



const postSchema = new Schema<IPost>({
    folderId: { type: String, required: true },
    content: {
        type: String,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },

    availability: { type: Number, enum: AvailabilityEnum, default: AvailabilityEnum.PUBLIC },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],

    updatedBy: [{ type: Types.ObjectId, ref: "User", required: true }],
    createdBy: [{ type: Types.ObjectId, ref: "User" }],

    deletedAt: { type: Date },
    restoredAt: { type: Date },

}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    collection: "SOCIAL_APP_Posts"
});

postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment",
    justOne: true
});



postSchema.pre(["find", "findOne", "countDocuments"], function () {
    if (this.getQuery().paranoid == false) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }
});

postSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate() as HydratedDocument<IPost>;

    if (update.deletedAt) {
        this.getQuery().paranoId = true;
        this.setQuery({
            ...this.getUpdate(),
            $unset: { restoredAt: 1 }
        });

    }
    if (update.restoredAt) {
        this.setQuery({
            ...this.getQuery(),
            paranoid: false,
            deletedAt: { $exists: false }
        });
        this.setUpdate({
            ...this.getUpdate(),
            $unset: { deletedAt: 1 }
        });
    }
    if (this.getQuery().paranoid == false) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }
});

postSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    if (this.getQuery().force == true) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }
});



export const PostModel = models.Post || model<IPost>("Post", postSchema);
PostModel.syncIndexes();
