import { adminService, AdminService } from "../admin.service";
import { IAuthUser } from "../../../common/types/express.types";
import { GQLAuthorization } from "../../../middleware";
import { endpoint } from "../admin.authorization";

export class AdminResolver {
    private adminService: AdminService;
    constructor() {
        this.adminService = adminService;
    }

    dashboard = async (parent: unknown, args: unknown, { user }: IAuthUser) => {
        await GQLAuthorization(endpoint.dashboard, user);
        const data = await this.adminService.dashboard();
        return { message: "Done", data };
    };
}
export const adminResolver = new AdminResolver();
