import { HydratedDocument, model, models, Schema, Types, } from "mongoose";
import { ChatEnum } from "../../common/enum";
import { IChat, IMessage } from "../../common/interfaces";

const messageSchema = new Schema<IMessage>({
    content: {
        type: String, required: function (this) {
            return !this.attachments?.length;
        }
    },
    attachments: { type: [String] },
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },

    deletedAt: { type: Date },
    restoredAt: { type: Date },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
});


const chatSchema = new Schema<IChat>({

    participants: [{ type: Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ChatEnum, default: ChatEnum.ovo },

    // OVM
    group: {
        type: String, required: function (this) {
            return this.type == ChatEnum.ovm;
        }
    },

    roomId: {
        type: String, required: function (this) {
            return this.type == ChatEnum.ovm;
        }
    },

    group_image: { type: String },

    messages: { type: [messageSchema], required: true },

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date },
    restoredAt: { type: Date }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
    strictQuery: true,
    collection: "SOCIAL_APP_CHATS"
});





chatSchema.pre(["find", "findOne", "countDocuments"], function () {
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

chatSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate() as HydratedDocument<IChat>;

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


chatSchema.pre(["deleteOne", "findOneAndDelete"], async function () {
    if (this.getQuery().force == true) {
        this.setQuery({
            ...this.getQuery(),
        });
    } else {
        this.setQuery({
            ...this.getQuery(),
            deletedAt: { $exists: true }
        });
    }
});




export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
ChatModel.syncIndexes();
