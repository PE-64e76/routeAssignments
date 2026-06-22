import { commentService, CommentService } from "../comment.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLValidation } from "../../../middleware";
import { commentListGQL, getCommentGQL, createCommentGQL, replayOnCommentGQL, updateCommentGQL, deleteCommentGQL, restoreCommentGQL, reactCommentGQL, unreactCommentGQL } from "../comment.validation";
import { CommentListArgsDto, GetCommentArgsDto, CreateCommentArgsDto, ReplayOnCommentArgsDto, UpdateCommentArgsDto, DeleteCommentArgsDto, RestoreCommentArgsDto, ReactCommentArgsDto, UnreactCommentArgsDto } from "../comment.dto";

export class CommentResolver {
    private commentService: CommentService;
    constructor() {
        this.commentService = commentService;
    }

    commentList = async (parent: unknown, args: CommentListArgsDto, { user }: IAuthUser) => {
        await GQLValidation<CommentListArgsDto>(commentListGQL, args);
        const { postId, ...query } = args;
        const data = await this.commentService.commentList({ postId }, query, user);
        return { message: "Done", data };
    };

    getComment = async (parent: unknown, args: GetCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<GetCommentArgsDto>(getCommentGQL, args);
        const data = await this.commentService.getComment(args, user);
        return { message: "Done", data };
    };

    createComment = async (parent: unknown, args: CreateCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<CreateCommentArgsDto>(createCommentGQL, args);
        const { postId, ...body } = args;
        const data = await this.commentService.createComment({ postId }, body, user);
        return { message: "Done", data };
    };

    replayOnComment = async (parent: unknown, args: ReplayOnCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<ReplayOnCommentArgsDto>(replayOnCommentGQL, args);
        const { postId, commentId, ...body } = args;
        const data = await this.commentService.replayOnComment({ postId, commentId }, body, user);
        return { message: "Done", data };
    };

    updateComment = async (parent: unknown, args: UpdateCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<UpdateCommentArgsDto>(updateCommentGQL, args);
        const { postId, commentId, ...body } = args;
        const data = await this.commentService.updateComment({ postId, commentId }, body, user);
        return { message: "Done", data };
    };

    deleteComment = async (parent: unknown, args: DeleteCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<DeleteCommentArgsDto>(deleteCommentGQL, args);
        const { postId, commentId, force } = args;
        const data = await this.commentService.deleteComment({ postId, commentId }, { force }, user);
        return { message: "Done", data };
    };

    restoreComment = async (parent: unknown, args: RestoreCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<RestoreCommentArgsDto>(restoreCommentGQL, args);
        const data = await this.commentService.restoreComment(args, user);
        return { message: "Done", data };
    };

    reactComment = async (parent: unknown, args: ReactCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<ReactCommentArgsDto>(reactCommentGQL, args);
        const { postId, commentId, react } = args;
        const data = await this.commentService.reactComment({ postId, commentId }, { react }, user);
        return { message: "Done", data };
    };

    unreactComment = async (parent: unknown, args: UnreactCommentArgsDto, { user }: IAuthUser) => {
        await GQLValidation<UnreactCommentArgsDto>(unreactCommentGQL, args);
        const data = await this.commentService.unreactComment(args, user);
        return { message: "Done", data };
    };
}
export const commentResolver = new CommentResolver();
