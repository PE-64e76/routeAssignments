import { storyService, StoryService } from "../story.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLValidation } from "../../../middleware";
import { getUserStoriesGQL, getStoryGQL, viewStoryGQL, deleteStoryGQL } from "../story.validation";
import { GetUserStoriesArgsDto, GetStoryArgsDto, ViewStoryArgsDto, DeleteStoryArgsDto } from "../story.dto";

export class StoryResolver {
    private storyService: StoryService;
    constructor() {
        this.storyService = storyService;
    }

    storyFeed = async (parent: unknown, args: unknown, { user }: IAuthUser) => {
        const data = await this.storyService.storyFeed(user);
        return { message: "Done", data };
    };

    userStories = async (parent: unknown, args: GetUserStoriesArgsDto, { user }: IAuthUser) => {
        await GQLValidation<GetUserStoriesArgsDto>(getUserStoriesGQL, args);
        const data = await this.storyService.getUserStories(args, user);
        return { message: "Done", data };
    };

    getStory = async (parent: unknown, args: GetStoryArgsDto, { user }: IAuthUser) => {
        await GQLValidation<GetStoryArgsDto>(getStoryGQL, args);
        const data = await this.storyService.getStory(args, user);
        return { message: "Done", data };
    };

    viewStory = async (parent: unknown, args: ViewStoryArgsDto, { user }: IAuthUser) => {
        await GQLValidation<ViewStoryArgsDto>(viewStoryGQL, args);
        const data = await this.storyService.viewStory(args, user);
        return { message: "Done", data };
    };

    deleteStory = async (parent: unknown, args: DeleteStoryArgsDto, { user }: IAuthUser) => {
        await GQLValidation<DeleteStoryArgsDto>(deleteStoryGQL, args);
        const data = await this.storyService.deleteStory(args, user);
        return { message: "Done", data };
    };
}
export const storyResolver = new StoryResolver();
