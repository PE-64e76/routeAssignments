import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { INotification } from "../../common/interfaces";



const notificationSchema = new Schema<INotification>({
    title: { type: String, required: true },
    body: { type: String, required: true },

    recipients: [{ type: Types.ObjectId, ref: "User" }],
    isBroadcast: { type: Boolean, default: false },

    readBy: [{ type: Types.ObjectId, ref: "User" }],

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },

    deletedAt: { type: Date },
    restoredAt: { type: Date },

}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strict: true,
});

notificationSchema.pre(["find", "findOne", "countDocuments"], function () {
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

notificationSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate() as HydratedDocument<INotification>;

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

notificationSchema.pre(["deleteOne", "findOneAndDelete"], function () {
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

export const NotificationModel = models.Notification || model<INotification>("Notification", notificationSchema);
NotificationModel.syncIndexes();
