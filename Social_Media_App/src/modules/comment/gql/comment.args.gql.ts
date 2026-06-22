import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { ReactionGQLEnumType } from "../../post/gql/post.types.gql";

export const commentList = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    page: { type: GraphQLInt },
    size: { type: GraphQLInt },
    search: { type: GraphQLString },
};

export const getComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
};

export const createComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLID) },
};

export const replayOnComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLID) },
};

export const updateComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLID) },
    removeTags: { type: new GraphQLList(GraphQLID) },
};

export const deleteComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
    force: { type: GraphQLBoolean },
};

export const restoreComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
};

export const reactComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
    react: { type: new GraphQLNonNull(ReactionGQLEnumType) },
};

export const unreactComment = {
    postId: { type: new GraphQLNonNull(GraphQLID) },
    commentId: { type: new GraphQLNonNull(GraphQLID) },
};
