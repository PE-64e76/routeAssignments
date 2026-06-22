import { postService, PostService } from "../post.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLValidation } from "../../../middleware";
import { PaginateDto, paginationvalidationSchema } from "../../../common/validation";
import { reactOnPostGQL, deletePostGQL, restorePostGQL, profilePostsGQL, unreactOnPostGQL } from "../post.validation";
import { ReactOnPostArgsDto, DeletePostArgsDto, RestorePostArgsDto, ProfilePostsArgsDto, UnreactOnPostArgsDto } from "../post.dto";


export class PostResolver {
    private postService: PostService;
    constructor() {
        this.postService = postService;
    }

    postList = async (parent: unknown, args: PaginateDto, { user, decoded }: IAuthUser) => {
        await GQLValidation<PaginateDto>(paginationvalidationSchema.query, args);
        const data = await this.postService.postList(args, user);
        return { message: "Done", data };
    };

    postFeed = async (parent: unknown, args: PaginateDto, { user }: IAuthUser) => {
        await GQLValidation<PaginateDto>(paginationvalidationSchema.query, args);
        const data = await this.postService.postFeed(args, user);
        return { message: "Done", data };
    };

    profilePosts = async (parent: unknown, args: ProfilePostsArgsDto, { user }: IAuthUser) => {
        await GQLValidation<ProfilePostsArgsDto>(profilePostsGQL, args);
        const { userId, ...query } = args;
        const data = await this.postService.profilePosts(userId, query, user);
        return { message: "Done", data };
    };

    reactOnPost = async (parent: unknown, { postId, react }: ReactOnPostArgsDto, { user }: IAuthUser) => {
        await GQLValidation<ReactOnPostArgsDto>(reactOnPostGQL, { postId, react });
        const data = await this.postService.reactPost({ postId }, { react }, user);
        return { message: "Done", data };
    };

    unreactOnPost = async (parent: unknown, args: UnreactOnPostArgsDto, { user }: IAuthUser) => {
        await GQLValidation<UnreactOnPostArgsDto>(unreactOnPostGQL, args);
        const data = await this.postService.unreactPost(args, user);
        return { message: "Done", data };
    };

    deletePost = async (parent: unknown, args: DeletePostArgsDto, { user }: IAuthUser) => {
        await GQLValidation<DeletePostArgsDto>(deletePostGQL, args);
        const { postId, force } = args;
        const data = await this.postService.deletePost({ postId }, { force }, user);
        return { message: "Done", data };
    };

    restorePost = async (parent: unknown, args: RestorePostArgsDto, { user }: IAuthUser) => {
        await GQLValidation<RestorePostArgsDto>(restorePostGQL, args);
        const data = await this.postService.restorePost(args, user);
        return { message: "Done", data };
    };
}
export const postResolver = new PostResolver();