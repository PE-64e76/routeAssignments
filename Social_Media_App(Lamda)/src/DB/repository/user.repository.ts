import { QueryFilter } from "mongoose";
import { IUser } from "../../common/interfaces";
import { BaseRepository } from "./base.repository";
import { UserModel } from "../model";

export class UserRepository extends BaseRepository<IUser> {

    constructor() {
        super(UserModel);
    }

    async deleteOne({ filter }: { filter: QueryFilter<IUser>; }): Promise<{ deletedCount: number; }> {
        const result = await this.model.updateOne({ ...filter, deletedAt: { $exists: false } }, { $set: { deletedAt: new Date() } });
        const deletedCount = (result.modifiedCount ?? 0) as number;
        return { deletedCount };
    }
}