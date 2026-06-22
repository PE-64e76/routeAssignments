import { HydratedDocument } from "mongoose";
import { IUser } from "../interfaces";
import { AvailabilityEnum } from "../enum";


export const getAvailability = (user: HydratedDocument<IUser>) => {
    return [
        { availability: AvailabilityEnum.PUBLIC },
        { availability: AvailabilityEnum.ONLYME, createdBy: user._id },
        { availability: AvailabilityEnum.FRIENDS, createdBy: { $in: [user._id, ...(user.friends || [])] } },
        { tags: { $in: [user._id] } },
    ];
};