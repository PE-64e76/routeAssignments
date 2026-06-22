import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

export const dashboard = new GraphQLObjectType({
    name: "AdminDashboardResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "AdminDashboardData",
                fields: {
                    usersCount: { type: new GraphQLNonNull(GraphQLInt) },
                    postsCount: { type: new GraphQLNonNull(GraphQLInt) },
                    commentsCount: { type: new GraphQLNonNull(GraphQLInt) },
                    newUsersThisWeek: { type: new GraphQLNonNull(GraphQLInt) },
                    newPostsThisWeek: { type: new GraphQLNonNull(GraphQLInt) },
                    deletedUsersCount: { type: new GraphQLNonNull(GraphQLInt) },
                    deletedPostsCount: { type: new GraphQLNonNull(GraphQLInt) },
                }
            })
        }
    }
});
