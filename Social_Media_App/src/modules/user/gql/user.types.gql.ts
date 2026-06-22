import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../../common/enum";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../../common/interfaces";

export const GenderGQLEnumType = new GraphQLEnumType({
    name: "GenderGQLEnumType",
    values: {
        Male: { value: GenderEnum.MALE },
        Female: { value: GenderEnum.FEMALE },
    }
});
export const ProviderGQLEnumType = new GraphQLEnumType({
    name: "ProviderGQLEnumType",
    values: {
        Google: { value: ProviderEnum.GOOGLE },
        System: { value: ProviderEnum.SYSTEM },
    }
});
export const RoleGQLEnumType = new GraphQLEnumType({
    name: "RoleGQLEnumType",
    values: {
        Admin: { value: RoleEnum.ADMIN },
        User: { value: RoleEnum.USER },
    }
});

export const OneUserType: GraphQLObjectType = new GraphQLObjectType({
    name: "OneUserType",
    fields: () => ({

        _id: { type: new GraphQLNonNull(GraphQLID) },
        username: {
            type: GraphQLString,
            resolve: (parent: HydratedDocument<IUser>) => {
                console.log(parent);
                return parent.gender === GenderEnum.MALE ? `Mr:${parent.username}` : `Mrs:${parent.username }`;
            }
        },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        slug: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLString },
        phone: { type: GraphQLString },
        profilePicture: { type: GraphQLString },
        profileCoverPictures: { type: new GraphQLList(GraphQLString) },


        DOB: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        restoredAt: { type: GraphQLString },
        confirmEmail: { type: GraphQLString },
        changeCredentialsTime: { type: GraphQLString },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        updatedAt: { type: GraphQLString },

        gender: { type: GenderGQLEnumType },
        provider: { type: ProviderGQLEnumType },
        role: { type: RoleGQLEnumType },

        friends: { type: new GraphQLList(OneUserType) }

    }),
});

export const profile = new GraphQLNonNull(new GraphQLObjectType({
    name: "ProfileResponse",
    description: "",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: OneUserType
        }
    }
}));

export const updateProfile = new GraphQLObjectType({
    name: "UpdateProfileResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneUserType }
    }
});

export const deleteProfile = new GraphQLObjectType({
    name: "DeleteProfileResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "DeleteProfileResult",
                fields: {
                    deletedCount: { type: new GraphQLNonNull(GraphQLInt) }
                }
            })
        }
    }
});

export const restoreUser = new GraphQLObjectType({
    name: "RestoreUserResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: OneUserType }
    }
});

export const dashboard = new GraphQLObjectType({
    name: "UserDashboardResponse",
    fields: {
        message: { type: new GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: "UserDashboardData",
                fields: {
                    postsCount: { type: new GraphQLNonNull(GraphQLInt) },
                    commentsCount: { type: new GraphQLNonNull(GraphQLInt) },
                    reactionsReceived: { type: new GraphQLNonNull(GraphQLInt) },
                    friendsCount: { type: new GraphQLNonNull(GraphQLInt) },
                }
            })
        }
    }
});