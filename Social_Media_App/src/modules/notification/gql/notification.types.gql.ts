import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";

export const OneNotificationType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneNotificationType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },

        title: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },

        recipients: { type: new GraphQLList(OneUserType) },
        isBroadcast: { type: new GraphQLNonNull(GraphQLBoolean) },
        readBy: { type: new GraphQLList(OneUserType) },

        createdBy: { type: new GraphQLNonNull(OneUserType) },
        updatedBy: { type: OneUserType },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        deletedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
    }),
});

export const notificationList = new GraphQLNonNull(new GraphQLObjectType({
    name: "NotificationListResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "NotificationPaginationResponse",
                fields: {
                    docs: { type: new GraphQLList(OneNotificationType) },
                    currentPage: { type: GraphQLInt },
                    pages: { type: GraphQLInt },
                    size: { type: GraphQLInt },
                }
            })
        }
    }
}));

export const oneNotification = new GraphQLObjectType({
    name: "OneNotificationResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneNotificationType }
    }
});

export const deleteNotification = new GraphQLObjectType({
    name: "DeleteNotificationResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "DeleteNotificationResult",
                fields: {
                    deletedCount: { type: new GraphQLNonNull(GraphQLInt) }
                }
            })
        }
    }
});
