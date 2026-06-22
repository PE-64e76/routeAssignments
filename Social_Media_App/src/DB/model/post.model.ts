import { HydratedDocument, Model, model, models, Schema, Types } from "mongoose";
import { AvailabilityEnum, ReactionEnum } from "../../common/enum";
import { IPost } from "../../common/interfaces";
import { CommentModel } from "./comment.model";



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
    reactions: [{
        user: { type: Types.ObjectId, ref: "User", required: true },
        type: { type: Number, enum: ReactionEnum, required: true }
    }],
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

const cascadeToComments = async function (this: { model: Model<IPost>; }, postIds: Types.ObjectId[], force: boolean) {
    if (!postIds.length) return;

    if (force) {
        await CommentModel.deleteMany({ postId: { $in: postIds }, force: true });
    } else {
        await CommentModel.updateMany(
            { postId: { $in: postIds } },
            { deletedAt: new Date() }
        );
    }
};

postSchema.pre("updateMany", async function () {
    const update = this.getUpdate() as HydratedDocument<IPost>;

    if (update.deletedAt) {
        const { force: _force, ...lookupFilter } = this.getQuery();
        const posts = await this.model.find(lookupFilter).select("_id");
        this.setUpdate({
            ...update,
            $unset: { restoredAt: 1 }
        });
        await cascadeToComments.call(this, posts.map(post => post._id), false);
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

postSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
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
    const posts = await this.model.find(lookupFilter).select("_id");
    await cascadeToComments.call(this, posts.map(post => post._id), force);
});

postSchema.pre("deleteMany", async function () {
    const force = this.getQuery().force == true;
    const { force: _force, ...lookupFilter } = this.getQuery();
    const posts = await this.model.find(lookupFilter).select("_id");
    if (force) {
        this.setQuery(lookupFilter);
    } else {
        this.setQuery({
            ...lookupFilter,
            deletedAt: { $exists: false }
        });
    }
    await cascadeToComments.call(this, posts.map(post => post._id), force);
});



export const PostModel = models.Post || model<IPost>("Post", postSchema);
PostModel.syncIndexes();
