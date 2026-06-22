import { HydratedDocument, PopulateOptions } from "mongoose";
import { IStory, IUser } from "../../common/interfaces";
import { s3Service, S3Service } from "../../common/services";
import { StoryRepository } from "../../DB/repository";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../common/exceptions";
import { randomUUID } from "node:crypto";
import { CreateStoryBodyDto, GetUserStoriesParamsDto, GetStoryParamsDto, ViewStoryParamsDto, DeleteStoryParamsDto } from "./story.dto";

export class StoryService {
    private populate: PopulateOptions[] = [
        { path: "createdBy" },
        { path: "viewers" },
    ];
    private readonly s3: S3Service;
    private readonly storyRepository: StoryRepository;

    constructor() {
        this.s3 = s3Service;
        this.storyRepository = new StoryRepository();
    }

    async createStory({ content, files = [] }: CreateStoryBodyDto, user: HydratedDocument<IUser>): Promise<IStory> {

        const folderId = randomUUID();
        let attachments: string[] = [];
        if (files?.length) {
            attachments = await this.s3.uploadAssets({
                files: files as Express.Multer.File[],
                path: `Story/${user._id.toString()}/${folderId}`
            });
        }

        const story = await this.storyRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
            }
        });

        if (!story) {
            if (attachments.length) {
                await this.s3.deleteAssets({
                    Keys: attachments.map(ele => { return { Key: ele }; })
                });
            }
            throw new BadRequestException("Fail to create story");
        }

        const populated = await this.storyRepository.findOne({
            filter: { _id: story._id },
            options: { populate: this.populate }
        });
        return populated!.toJSON();
    }

    async storyFeed(user: HydratedDocument<IUser>): Promise<IStory[]> {
        const stories = await this.storyRepository.find({
            filter: {
                createdBy: { $in: [user._id, ...(user.friends || [])] }
            },
            options: {
                populate: this.populate,
                sort: { createdAt: -1 }
            }
        });
        return stories.map(story => story.toJSON());
    }

    async getUserStories({ userId }: GetUserStoriesParamsDto, user: HydratedDocument<IUser>): Promise<IStory[]> {

        const isOwnProfile = userId === user._id.toString();
        const isFriend = (user.friends || []).some(friendId => friendId.toString() === userId);
        if (!isOwnProfile && !isFriend) {
            throw new ForbiddenException("You are not allowed to view this user's stories");
        }

        const stories = await this.storyRepository.find({
            filter: { createdBy: userId },
            options: {
                populate: this.populate,
                sort: { createdAt: -1 }
            }
        });
        return stories.map(story => story.toJSON());
    }

    async getStory({ storyId }: GetStoryParamsDto, user: HydratedDocument<IUser>): Promise<IStory> {
        const story = await this.storyRepository.findOne({
            filter: { _id: storyId },
            options: { populate: this.populate }
        });
        if (!story) {
            throw new NotFoundException("Fail to find matching story, it may have expired");
        }

        const ownerId = (story.createdBy as { _id: { toString(): string; }; })._id?.toString() || story.createdBy.toString();
        const isOwner = ownerId === user._id.toString();
        const isFriend = (user.friends || []).some(friendId => friendId.toString() === ownerId);
        if (!isOwner && !isFriend) {
            throw new ForbiddenException("You are not allowed to view this story");
        }

        return story.toJSON();
    }

    async viewStory({ storyId }: ViewStoryParamsDto, user: HydratedDocument<IUser>): Promise<IStory> {
        const story = await this.storyRepository.findOneAndUpdate({
            filter: { _id: storyId },
            update: {
                $addToSet: { viewers: user._id }
            },
            populate: this.populate
        });
        if (!story) {
            throw new NotFoundException("Fail to find matching story, it may have expired");
        }
        return story.toJSON();
    }

    async deleteStory({ storyId }: DeleteStoryParamsDto, user: HydratedDocument<IUser>): Promise<{ deletedCount: number; }> {

        const story = await this.storyRepository.findOne({
            filter: { _id: storyId }
        });
        if (!story) {
            throw new NotFoundException("Fail to find matching story, it may have expired");
        }
        if (story.createdBy.toString() != user._id.toString()) {
            throw new ForbiddenException("You are not allowed to delete this story");
        }

        const result = await this.storyRepository.deleteOne({
            filter: { _id: storyId },
            force: true
        });
        if (!result.deletedCount) {
            throw new BadRequestException("Fail to delete story");
        }

        if (story.attachments?.length) {
            await this.s3.deleteAssets({
                Keys: story.attachments.map(ele => { return { Key: ele }; })
            });
        }

        return result;
    }

}

export const storyService = new StoryService();
