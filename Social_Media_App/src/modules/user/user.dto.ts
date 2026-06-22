import { z } from 'zod';
import { updatePassword, updateProfile, deleteProfile, restoreUser, updateProfileGQL, deleteProfileGQL, restoreUserGQL } from './user.validation';

export type UpdatePasswordBodyDto = z.infer<typeof updatePassword.body>;
export type UpdateProfileBodyDto = z.infer<typeof updateProfile.body>;
export type DeleteProfileQueryDto = z.infer<typeof deleteProfile.query>;
export type RestoreUserParamsDto = z.infer<typeof restoreUser.params>;

export type UpdateProfileArgsDto = z.infer<typeof updateProfileGQL>;
export type DeleteProfileArgsDto = z.infer<typeof deleteProfileGQL>;
export type RestoreUserArgsDto = z.infer<typeof restoreUserGQL>;
