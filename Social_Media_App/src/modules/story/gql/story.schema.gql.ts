import * as StoryGQLTypes from './story.types.gql';
import * as StoryGQLArgs from './story.args.gql';
import { storyResolver, StoryResolver } from './story.resolver';

export class StoryGQLSchema {
    private storyResolver: StoryResolver;
    constructor() {
        this.storyResolver = storyResolver;
    }
    registerQuery() {
        return {
            storyFeed: {
                type: StoryGQLTypes.storyFeed,
                resolve: this.storyResolver.storyFeed,
            },
            userStories: {
                type: StoryGQLTypes.userStories,
                args: StoryGQLArgs.userStories,
                resolve: this.storyResolver.userStories,
            },
            getStory: {
                type: StoryGQLTypes.oneStory,
                args: StoryGQLArgs.getStory,
                resolve: this.storyResolver.getStory,
            }
        };
    }

    registerMutation() {
        return {
            viewStory: {
                type: StoryGQLTypes.oneStory,
                args: StoryGQLArgs.viewStory,
                resolve: this.storyResolver.viewStory
            },
            deleteStory: {
                type: StoryGQLTypes.deleteStory,
                args: StoryGQLArgs.deleteStory,
                resolve: this.storyResolver.deleteStory
            }
        };
    }
}

export const storyGQLSchema = new StoryGQLSchema();
