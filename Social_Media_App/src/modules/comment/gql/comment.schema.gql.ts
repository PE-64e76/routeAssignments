import * as CommentGQLTypes from './comment.types.gql';
import * as CommentGQLArgs from './comment.args.gql';
import { commentResolver, CommentResolver } from './comment.resolver';

export class CommentGQLSchema {
    private commentResolver: CommentResolver;
    constructor() {
        this.commentResolver = commentResolver;
    }
    registerQuery() {
        return {
            commentList: {
                type: CommentGQLTypes.commentList,
                args: CommentGQLArgs.commentList,
                resolve: this.commentResolver.commentList,
            },
            getComment: {
                type: CommentGQLTypes.oneComment,
                args: CommentGQLArgs.getComment,
                resolve: this.commentResolver.getComment,
            }
        };
    }

    registerMutation() {
        return {
            createComment: {
                type: CommentGQLTypes.oneComment,
                args: CommentGQLArgs.createComment,
                resolve: this.commentResolver.createComment
            },
            replayOnComment: {
                type: CommentGQLTypes.oneComment,
                args: CommentGQLArgs.replayOnComment,
                resolve: this.commentResolver.replayOnComment
            },
            updateComment: {
                type: CommentGQLTypes.oneComment,
                args: CommentGQLArgs.updateComment,
                resolve: this.commentResolver.updateComment
            },
            deleteComment: {
                type: CommentGQLTypes.deleteComment,
                args: CommentGQLArgs.deleteComment,
                resolve: this.commentResolver.deleteComment
            },
            restoreComment: {
                type: CommentGQLTypes.oneComment,
                args: CommentGQLArgs.restoreComment,
                resolve: this.commentResolver.restoreComment
            },
            reactComment: {
                type: CommentGQLTypes.reactComment,
                args: CommentGQLArgs.reactComment,
                resolve: this.commentResolver.reactComment
            },
            unreactComment: {
                type: CommentGQLTypes.unreactComment,
                args: CommentGQLArgs.unreactComment,
                resolve: this.commentResolver.unreactComment
            }
        };
    }
}

export const commentGQLSchema = new CommentGQLSchema();
