import {z} from 'zod'
import { createPost, reactOnPostGQL, reactPost, updatePost, deletePost, restorePost, deletePostGQL, restorePostGQL, profilePosts, profilePostsGQL, unreactPost, unreactOnPostGQL } from './post.validation';

export type CreatePostBodyDto = z.infer<typeof createPost.body>
export type ReactPostBodyDto = z.infer<typeof reactPost.body>
export type ReactPostParamsDto = z.infer<typeof reactPost.params>

export type UpdatePostBodyDto = z.infer<typeof updatePost.body>
export type UpdatePostParamsDto = z.infer<typeof updatePost.params>
export type ReactOnPostArgsDto = z.infer<typeof reactOnPostGQL>

export type UnreactPostParamsDto = z.infer<typeof unreactPost.params>
export type UnreactOnPostArgsDto = z.infer<typeof unreactOnPostGQL>

export type DeletePostParamsDto = z.infer<typeof deletePost.params>
export type DeletePostQueryDto = z.infer<typeof deletePost.query>
export type RestorePostParamsDto = z.infer<typeof restorePost.params>

export type DeletePostArgsDto = z.infer<typeof deletePostGQL>
export type RestorePostArgsDto = z.infer<typeof restorePostGQL>

export type ProfilePostsParamsDto = z.infer<typeof profilePosts.params>
export type ProfilePostsArgsDto = z.infer<typeof profilePostsGQL>