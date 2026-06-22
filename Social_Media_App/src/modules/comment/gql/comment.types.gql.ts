import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";
import { OneReactionType } from "../../post/gql/post.types.gql";

export const OneCommentType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneCommentType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },

        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        reactions: { type: new GraphQLList(OneReactionType) },
        tags: { type: new GraphQLList(OneUserType) },

        postId: { type: new GraphQLNonNull(GraphQLID) },
        commentId: { type: GraphQLID },

        createdBy: { type: new GraphQLNonNull(OneUserType) },
        updatedBy: { type: OneUserType },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        deletedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
    }),
});

export const commentList = new GraphQLNonNull(new GraphQLObjectType({
    name: "CommentListResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "CommentPaginationResponse",
                fields: {
                    docs: { type: new GraphQLList(OneCommentType) },
                    currentPage: { type: GraphQLInt },
                    pages: { type: GraphQLInt },
                    size: { type: GraphQLInt },
                }
            })
        }
    }
}));

export const oneComment = new GraphQLObjectType({
    name: "OneCommentResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneCommentType }
    }
});

export const deleteComment = new GraphQLObjectType({
    name: "DeleteCommentResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "DeleteCommentResult",
                fields: {
                    deletedCount: { type: new GraphQLNonNull(GraphQLInt) }
                }
            })
        }
    }
});

export const reactComment = new GraphQLObjectType({
    name: "ReactCommentResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneCommentType }
    }
});

export const unreactComment = new GraphQLObjectType({
    name: "UnreactCommentResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneCommentType }
    }
});
