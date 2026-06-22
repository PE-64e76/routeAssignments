import { GraphQLID, GraphQLNonNull } from "graphql";

export const userStories = {
    userId: { type: new GraphQLNonNull(GraphQLID) },
};

export const getStory = {
    storyId: { type: new GraphQLNonNull(GraphQLID) },
};

export const viewStory = {
    storyId: { type: new GraphQLNonNull(GraphQLID) },
};

export const deleteStory = {
    storyId: { type: new GraphQLNonNull(GraphQLID) },
};
