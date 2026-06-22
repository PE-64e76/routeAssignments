import userService, { UserService } from "../user.service";
import { IAuthUser } from "../../../common/types/express.types";
import { endpoint } from "../user.authorization";
import { GQLAuthorization, GQLValidation } from "../../../middleware";
import { profileGQL, updateProfileGQL, deleteProfileGQL, restoreUserGQL } from "../user.validation";
import { UpdateProfileArgsDto, DeleteProfileArgsDto, RestoreUserArgsDto } from "../user.dto";


export class UserResolver {
    private userService: UserService;
    constructor() {
        this.userService = userService;
    }

    profile = async (parent: unknown, args: { search?: string; }, {user}: IAuthUser) => {
        await GQLAuthorization(endpoint.profile, user)
        await GQLValidation<{ search?: string; }>(profileGQL, args)
        const data = await this.userService.profile(user);
        return { message: `Hello`, data };
    };

    updateProfile = async (parent: unknown, args: UpdateProfileArgsDto, { user }: IAuthUser) => {
        await GQLValidation<UpdateProfileArgsDto>(updateProfileGQL, args);
        const data = await this.userService.updateProfile(args, user);
        return { message: "Done", data };
    };

    deleteProfile = async (parent: unknown, args: DeleteProfileArgsDto, { user }: IAuthUser) => {
        await GQLValidation<DeleteProfileArgsDto>(deleteProfileGQL, args);
        const data = await this.userService.deleteProfile(user, Boolean(args.force));
        return { message: "Done", data };
    };

    restoreUser = async (parent: unknown, args: RestoreUserArgsDto, { user }: IAuthUser) => {
        await GQLAuthorization(endpoint.restoreUser, user);
        await GQLValidation<RestoreUserArgsDto>(restoreUserGQL, args);
        const data = await this.userService.restoreProfile(args.userId);
        return { message: "Done", data };
    };

    dashboard = async (parent: unknown, args: unknown, { user }: IAuthUser) => {
        const data = await this.userService.dashboard(user);
        return { message: "Done", data };
    };
}
export const userResolver = new UserResolver();