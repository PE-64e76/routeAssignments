import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../user";
import { postGQLSchema } from "../post";
import { commentGQLSchema } from "../comment";
import { adminGQLSchema } from "../admin";
import { notificationGQLSchema } from "../notification";
import { storyGQLSchema } from "../story";

const query = new GraphQLObjectType({
    name: "RootSchemaQuery",
    description: "Optional text enhance understand api",
    fields:{
        ...userGQLSchema.registerQuery(),
        ...postGQLSchema.registerQuery(),
        ...commentGQLSchema.registerQuery(),
        ...adminGQLSchema.registerQuery(),
        ...notificationGQLSchema.registerQuery(),
        ...storyGQLSchema.registerQuery(),
    }
});

const mutation = new GraphQLObjectType({
    name: "RootSchemaMutation",
    description: "Optional text enhance understand api",
    fields: {
        ...userGQLSchema.registerMutation(),
        ...postGQLSchema.registerMutation(),
        ...commentGQLSchema.registerMutation(),
        ...adminGQLSchema.registerMutation(),
        ...notificationGQLSchema.registerMutation(),
        ...storyGQLSchema.registerMutation()
    }
});


export const schema = new GraphQLSchema({ query, mutation });