import { z } from 'zod';
import { createComment, replayOnComment } from './comment.validation';

export type CreateCommentBodyDto = z.infer<typeof createComment.body>;
export type CreateCommentParamsDto = z.infer<typeof createComment.params>;
export type CreateReplayOnCommentParamsDto = z.infer<typeof replayOnComment.params>;
