import { HydratedDocument, Model, model, models, Schema, Types } from "mongoose";
import { IComment } from "../../common/interfaces";
import { ReactionEnum } from "../../common/enum";



const commentSchema = new Schema<IComment>({

    content: {
        type: String,
        required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },

    reactions: [{
        user: { type: Types.ObjectId, ref: "User", required: true },
        type: { type: Number, enum: ReactionEnum, required: true }
    }],
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
        this.setUpdate({
            ...update,
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

const cascadeToReplies = async function (this: { model: Model<IComment>; }, commentIds: Types.ObjectId[], force: boolean) {
    if (!commentIds.length) return;

    if (force) {
        await this.model.deleteMany({ commentId: { $in: commentIds }, force: true });
    } else {
        await this.model.updateMany(
            { commentId: { $in: commentIds } },
            { deletedAt: new Date() }
        );
    }
};

commentSchema.pre("updateMany", async function () {
    const update = this.getUpdate() as HydratedDocument<IComment>;

    if (update.deletedAt) {
        const { force: _force, ...lookupFilter } = this.getQuery();
        const comments = await this.model.find(lookupFilter).select("_id");
        this.setUpdate({
            ...update,
            $unset: { restoredAt: 1 }
        });
        await cascadeToReplies.call(this, comments.map(comment => comment._id), false);
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

commentSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
    const force = this.getQuery().force == true;
    if (force) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: false }
        });
    }

    const { force: _force, ...lookupFilter } = this.getQuery();
    const comments = await this.model.find(lookupFilter).select("_id");
    await cascadeToReplies.call(this, comments.map(comment => comment._id), force);
});

commentSchema.pre("deleteMany", async function () {
    const force = this.getQuery().force == true;
    const { force: _force, ...lookupFilter } = this.getQuery();
    const comments = await this.model.find(lookupFilter).select("_id");
    if (!force) {
        this.setQuery({
            ...lookupFilter,
            deletedAt: { $exists: false }
        });
    } else {
        this.setQuery(lookupFilter);
    }
    await cascadeToReplies.call(this, comments.map(comment => comment._id), force);
});



export const CommentModel = models.Comment || model<IComment>("Comment", commentSchema);
CommentModel.syncIndexes();
