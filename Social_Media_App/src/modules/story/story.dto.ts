import { z } from 'zod';
import { createStory, getUserStories, getStory, viewStory, deleteStory, getUserStoriesGQL, getStoryGQL, viewStoryGQL, deleteStoryGQL } from './story.validation';

export type CreateStoryBodyDto = z.infer<typeof createStory.body>;

export type GetUserStoriesParamsDto = z.infer<typeof getUserStories.params>;
export type GetStoryParamsDto = z.infer<typeof getStory.params>;
export type ViewStoryParamsDto = z.infer<typeof viewStory.params>;
export type DeleteStoryParamsDto = z.infer<typeof deleteStory.params>;

export type GetUserStoriesArgsDto = z.infer<typeof getUserStoriesGQL>;
export type GetStoryArgsDto = z.infer<typeof getStoryGQL>;
export type ViewStoryArgsDto = z.infer<typeof viewStoryGQL>;
export type DeleteStoryArgsDto = z.infer<typeof deleteStoryGQL>;
