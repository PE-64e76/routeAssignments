import { IUser } from "../../common/interfaces";
import { BaseRepository } from "./base.repository";
import { UserModel } from "../model";

export class UserRepository extends BaseRepository<IUser> {

    constructor() {
        super(UserModel);
    }
}