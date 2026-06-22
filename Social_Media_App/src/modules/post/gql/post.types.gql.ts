import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { AvailabilityEnum, ReactionEnum } from "../../../common/enum";
import { OneUserType } from "../../user/gql/user.types.gql";


export const AvailabilityGQLEnumType = new GraphQLEnumType({
    name: "AvailabilityEnum",
    values: {
        Public: { value: AvailabilityEnum.PUBLIC },
        Friends: { value: AvailabilityEnum.FRIENDS },
        Only_me: { value: AvailabilityEnum.ONLYME },
    }
});

export const ReactionGQLEnumType = new GraphQLEnumType({
    name: "ReactionEnum",
    values: {
        Like: { value: ReactionEnum.LIKE },
        Love: { value: ReactionEnum.LOVE },
        Care: { value: ReactionEnum.CARE },
        Wow: { value: ReactionEnum.WOW },
        Sad: { value: ReactionEnum.SAD },
        Angry: { value: ReactionEnum.ANGRY },
    }
});

export const OneReactionType = new GraphQLObjectType({
    name: "OneReactionType",
    fields: {
        user: { type: new GraphQLNonNull(OneUserType) },
        type: { type: new GraphQLNonNull(ReactionGQLEnumType) },
    }
});

export const OnePostType = new GraphQLObjectType({
    name: "OnePostType",
    fields: {
        _id: { type: new GraphQLNonNull(GraphQLID) },

        folderId: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        reactions: { type: new GraphQLList(OneReactionType) },
        tags: { type: new GraphQLList(OneUserType) },
        createdBy: { type: new GraphQLNonNull(OneUserType) },
        updatedBy: { type: OneUserType },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        deletedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },

        availability: { type: AvailabilityGQLEnumType },
    }
});

export const postList = new GraphQLNonNull(new GraphQLObjectType({
    name: "PostListResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "PostPaginationResponse",
                fields: {
                    docs: { type: new GraphQLList(OnePostType) },
                    currentPage: { type: GraphQLInt },
                    pages: { type: GraphQLInt },
                    size: { type: GraphQLInt },
                }
            })
        }
    }
}));

export const postFeed = new GraphQLNonNull(new GraphQLObjectType({
    name: "PostFeedResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "PostFeedPaginationResponse",
                fields: {
                    docs: { type: new GraphQLList(OnePostType) },
                    currentPage: { type: GraphQLInt },
                    pages: { type: GraphQLInt },
                    size: { type: GraphQLInt },
                }
            })
        }
    }
}));

export const profilePosts = new GraphQLNonNull(new GraphQLObjectType({
    name: "ProfilePostsResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "ProfilePostsPaginationResponse",
                fields: {
                    docs: { type: new GraphQLList(OnePostType) },
                    currentPage: { type: GraphQLInt },
                    pages: { type: GraphQLInt },
                    size: { type: GraphQLInt },
                }
            })
        }
    }
}));

export const reactOnPost = new GraphQLObjectType({
    name:"ReactOnPostResponse",
    fields:{
        message:{type:new GraphQLNonNull(GraphQLString)},
        data:{type: OnePostType}
    }
})

export const unreactOnPost = new GraphQLObjectType({
    name: "UnreactOnPostResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OnePostType }
    }
});

export const restorePost = new GraphQLObjectType({
    name: "RestorePostResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OnePostType }
    }
});

export const deletePost = new GraphQLObjectType({
    name: "DeletePostResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "DeletePostResult",
                fields: {
                    deletedCount: { type: new GraphQLNonNull(GraphQLInt) }
                }
            })
        }
    }
});
