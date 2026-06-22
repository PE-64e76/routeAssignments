import { GraphQLString } from "graphql";
import * as UserGQLTypes from './user.types.gql';
import * as UserGQLArgs from './user.args.gql';
import { userResolver, UserResolver } from "./user.resolver";


export class UserGQLSchema {
    private userResolver: UserResolver;
    constructor() {
        this.userResolver = userResolver;
    }

    registerQuery() {
        return {
            profile: {
                description: "Test profile Point",
                type: UserGQLTypes.profile,
                args: UserGQLArgs.profile,
                resolve: this.userResolver.profile
            },
            dashboard: {
                type: UserGQLTypes.dashboard,
                resolve: this.userResolver.dashboard
            },
        };
    }

    registerMutation() {
        return {
            like: {
                type: GraphQLString,
                description: "Test welcome point",
                resolve: () => {
                    return `Hello`;
                }
            },
            updateProfile: {
                type: UserGQLTypes.updateProfile,
                args: UserGQLArgs.updateProfile,
                resolve: this.userResolver.updateProfile
            },
            deleteProfile: {
                type: UserGQLTypes.deleteProfile,
                args: UserGQLArgs.deleteProfile,
                resolve: this.userResolver.deleteProfile
            },
            restoreUser: {
                type: UserGQLTypes.restoreUser,
                args: UserGQLArgs.restoreUser,
                resolve: this.userResolver.restoreUser
            }
        };
    }
}
export const userGQLSchema = new UserGQLSchema();