import { z } from 'zod';
import { createComment, replayOnComment, commentList, getComment, updateComment, deleteComment, restoreComment, commentListGQL, getCommentGQL, createCommentGQL, replayOnCommentGQL, updateCommentGQL, deleteCommentGQL, restoreCommentGQL, reactComment, unreactComment, reactCommentGQL, unreactCommentGQL } from './comment.validation';

export type CreateCommentBodyDto = z.infer<typeof createComment.body>;
export type CreateCommentParamsDto = z.infer<typeof createComment.params>;
export type CreateReplayOnCommentParamsDto = z.infer<typeof replayOnComment.params>;

export type CommentListParamsDto = z.infer<typeof commentList.params>;
export type CommentListQueryDto = z.infer<typeof commentList.query>;

export type GetCommentParamsDto = z.infer<typeof getComment.params>;

export type UpdateCommentParamsDto = z.infer<typeof updateComment.params>;
export type UpdateCommentBodyDto = z.infer<typeof updateComment.body>;

export type DeleteCommentParamsDto = z.infer<typeof deleteComment.params>;
export type DeleteCommentQueryDto = z.infer<typeof deleteComment.query>;

export type RestoreCommentParamsDto = z.infer<typeof restoreComment.params>;

export type ReactCommentParamsDto = z.infer<typeof reactComment.params>;
export type ReactCommentBodyDto = z.infer<typeof reactComment.body>;
export type UnreactCommentParamsDto = z.infer<typeof unreactComment.params>;

export type CommentListArgsDto = z.infer<typeof commentListGQL>;
export type GetCommentArgsDto = z.infer<typeof getCommentGQL>;
export type CreateCommentArgsDto = z.infer<typeof createCommentGQL>;
export type ReplayOnCommentArgsDto = z.infer<typeof replayOnCommentGQL>;
export type UpdateCommentArgsDto = z.infer<typeof updateCommentGQL>;
export type DeleteCommentArgsDto = z.infer<typeof deleteCommentGQL>;
export type RestoreCommentArgsDto = z.infer<typeof restoreCommentGQL>;
export type ReactCommentArgsDto = z.infer<typeof reactCommentGQL>;
export type UnreactCommentArgsDto = z.infer<typeof unreactCommentGQL>;
