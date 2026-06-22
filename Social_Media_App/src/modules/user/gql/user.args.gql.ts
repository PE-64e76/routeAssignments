import { GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { GenderGQLEnumType } from "./user.types.gql";


export const profile = {
    search: { type: GraphQLString }
};

export const updateProfile = {
    username: { type: GraphQLString },
    phone: { type: GraphQLString },
    DOB: { type: GraphQLString },
    gender: { type: GenderGQLEnumType },
};

export const deleteProfile = {
    force: { type: GraphQLBoolean },
};

export const restoreUser = {
    userId: { type: new GraphQLNonNull(GraphQLID) },
};