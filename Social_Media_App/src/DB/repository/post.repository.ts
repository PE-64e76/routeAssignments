import { IPost } from "../../common/interfaces";
import { BaseRepository } from "./base.repository";
import { PostModel } from "../model";

export class PostRepository extends BaseRepository<IPost> {

    constructor() {
        super(PostModel);
    }

}