import { INotification } from "../../common/interfaces";
import { BaseRepository } from "./base.repository";
import { NotificationModel } from "../model";

export class NotificationRepository extends BaseRepository<INotification> {

    constructor() {
        super(NotificationModel);
    }

}
