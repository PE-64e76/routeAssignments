import { IStory } from "../../common/interfaces";
import { BaseRepository } from "./base.repository";
import { StoryModel } from "../model";

export class StoryRepository extends BaseRepository<IStory> {

    constructor() {
        super(StoryModel);
    }

}
