import { GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";

export const OneStoryType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneStoryType",
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },

        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },

        viewers: { type: new GraphQLList(OneUserType) },
        createdBy: { type: new GraphQLNonNull(OneUserType) },

        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        expiresAt: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

export const storyFeed = new GraphQLNonNull(new GraphQLObjectType({
    name: "StoryFeedResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: new GraphQLList(OneStoryType) }
    }
}));

export const userStories = new GraphQLNonNull(new GraphQLObjectType({
    name: "UserStoriesResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: new GraphQLList(OneStoryType) }
    }
}));

export const oneStory = new GraphQLObjectType({
    name: "OneStoryResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneStoryType }
    }
});

export const deleteStory = new GraphQLObjectType({
    name: "DeleteStoryResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "DeleteStoryResult",
                fields: {
                    deletedCount: { type: new GraphQLNonNull(GraphQLInt) }
                }
            })
        }
    }
});
