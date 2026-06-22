import { IComment } from "../../common/interfaces";
import { CommentModel } from "../model";
import { BaseRepository } from "./base.repository";

export class CommentRepository extends BaseRepository<IComment> {

    constructor() {
        super(CommentModel);
    }

}