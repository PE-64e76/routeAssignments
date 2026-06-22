import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { ReactionGQLEnumType } from "./post.types.gql";

export const postList = {
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};

export const reactOnPost = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    react: {
        type: new GraphQLNonNull(ReactionGQLEnumType)
    }
};

export const unreactOnPost = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
};

export const restorePost = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
};

export const deletePost = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    force: { type: GraphQLBoolean },
};

export const postFeed = {
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};

export const profilePosts = {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};