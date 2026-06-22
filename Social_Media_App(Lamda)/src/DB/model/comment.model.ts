import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { IComment } from "../../common/interfaces";



const commentSchema = new Schema<IComment>({

    content: {
        type: String,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },

    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    commentId: { type: Types.ObjectId, ref: "Comment" },
    updatedBy: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: [{ type: Types.ObjectId, ref: "User", required: true }],
    deletedAt: { type: Date },
    restoredAt: { type: Date },

}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
    collection: "SOCIAL_APP_comments"
});

commentSchema.virtual("replay", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true
});


commentSchema.pre(["find", "findOne", "countDocuments"], function () {
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

commentSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate() as HydratedDocument<IComment>;

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

commentSchema.pre(["deleteOne", "findOneAndDelete"], function () {
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



export const CommentModel = models.Comment || model<IComment>("Comment", commentSchema);
CommentModel.syncIndexes();
