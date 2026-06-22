
import * as PostGQLTypes from './post.types.gql'
import * as PostGQLArgs from './post.args.gql'
import { postResolver, PostResolver} from './post.resolver'

export class PostGQLSchema {
    private postResolver: PostResolver
    constructor() {
        this.postResolver = postResolver
     }
    registerQuery() { 
        return {
            postList: {
                type: PostGQLTypes.postList ,
                args: PostGQLArgs.postList,
                resolve: this.postResolver.postList ,
            },
            postFeed: {
                type: PostGQLTypes.postFeed,
                args: PostGQLArgs.postFeed,
                resolve: this.postResolver.postFeed,
            },
            profilePosts: {
                type: PostGQLTypes.profilePosts,
                args: PostGQLArgs.profilePosts,
                resolve: this.postResolver.profilePosts,
            }
        };
    }

    registerMutation(){
        return{
            reactOnPost:{
                type:PostGQLTypes.reactOnPost,
                args:PostGQLArgs.reactOnPost,
                resolve:this.postResolver.reactOnPost
            },
            unreactOnPost: {
                type: PostGQLTypes.unreactOnPost,
                args: PostGQLArgs.unreactOnPost,
                resolve: this.postResolver.unreactOnPost
            },
            deletePost: {
                type: PostGQLTypes.deletePost,
                args: PostGQLArgs.deletePost,
                resolve: this.postResolver.deletePost
            },
            restorePost: {
                type: PostGQLTypes.restorePost,
                args: PostGQLArgs.restorePost,
                resolve: this.postResolver.restorePost
            }
        }
    }
}

export const postGQLSchema = new PostGQLSchema();