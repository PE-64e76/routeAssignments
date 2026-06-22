import * as AdminGQLTypes from './admin.types.gql';
import { adminResolver, AdminResolver } from './admin.resolver';

export class AdminGQLSchema {
    private adminResolver: AdminResolver;
    constructor() {
        this.adminResolver = adminResolver;
    }

    registerQuery() {
        return {
            adminDashboard: {
                type: AdminGQLTypes.dashboard,
                resolve: this.adminResolver.dashboard
            }
        };
    }

    registerMutation() {
        return {};
    }
}

export const adminGQLSchema = new AdminGQLSchema();
