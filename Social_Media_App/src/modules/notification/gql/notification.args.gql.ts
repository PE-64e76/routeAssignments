import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";

export const createNotification = {
    title: { type: new GraphQLNonNull(GraphQLString) },
    body: { type: new GraphQLNonNull(GraphQLString) },
    recipients: { type: new GraphQLList(GraphQLID) },
};

export const notificationList = {
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};

export const getNotification = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
};

export const markAsRead = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
};

export const updateNotification = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    recipients: { type: new GraphQLList(GraphQLID) },
};

export const deleteNotification = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
    force: { type: GraphQLBoolean },
};

export const restoreNotification = {
    notificationId: { type: new GraphQLNonNull(GraphQLID) },
};
