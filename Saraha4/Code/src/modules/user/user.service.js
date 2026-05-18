import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from "../../../config/config.service.js";
import { logoutEnum } from "../../common/enums/security.enum.js";
import { roleEnum } from "../../common/enums/user.enum.js";
import { BadRequestException, ConfilectException, ForbiddenException } from "../../common/utils/response/error.response.js";
import { createLoginCredentials, decodeToken } from "../../common/utils/security/token.security.js";
import { createOne, deleteMany, findOne } from "../../DB/database.service.js";
import { tokenModel, UserModel } from "../../DB/index.js";


export const logout = async ({flag},user, {jti, iat}) => {
  
  let status = 200
  switch (flag) {
    case logoutEnum.All:
      user.changeCredentialsTime = new Date()
      await user.save()
      await deleteMany({model: tokenModel, filter:{userId:user._id}} )
      break;
    default:
      await createOne({
        model: tokenModel,
        data: {
          userId: user._id,
          jti,
          expiresIn: new Date((iat + REFRESH_EXPIRES_IN) * 1000)
        }
      })
      status = 201
      break;
  }
  return status
};

export const profileCoverImage = async (files, user) => {
  const existingCount = user.coverProfilePictures?.length || 0;
  const newCount = files.length;

  if (existingCount + newCount !== 2) {
    throw BadRequestException({
      message: `Total cover images must equal 2. You currently have ${existingCount} and are uploading ${newCount}.`
    });
  }

  user.coverProfilePictures = [
    ...user.coverProfilePictures,
    ...files.map(file => file.finalPath)
  ];
  await user.save();
  return user;
};

export const profileImage = async (file, user) => {
  if (user.profilePicture) {
    user.gallery = user.gallery || [];
    user.gallery.push(user.profilePicture);
  }
  user.profilePicture = file.finalPath;
  await user.save();
  return user;
};

export const removeProfileImage = async (user) => {
  if (!user.profilePicture) {
    throw BadRequestException({ message: "No profile picture to remove" });
  }

  const absolutePath = resolve(user.profilePicture);
  if (existsSync(absolutePath)) {
    unlinkSync(absolutePath);
  }

  user.profilePicture = undefined;
  await user.save();
  return user;
};

export const visitProfile = async (userId, requestingUser) => {
  const profile = await findOne({
    model: UserModel,
    filter: { _id: userId },
    select: "phone profilePicture firstName lastName email username visitCount role"
  });

  if (!profile) {
    throw BadRequestException({ message: "Fail to find matching profile" });
  }

  profile.visitCount = (profile.visitCount || 0) + 1;
  await profile.save();

  const isAdmin = requestingUser?.role === roleEnum.Admin;

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    email: profile.email,
    profilePicture: profile.profilePicture,
    ...(isAdmin && { visitCount: profile.visitCount })
  };
};


export const profile = async (user) => {
  return user
};


export const shareProfile = async(userId) =>{
  const profile = await findOne({
    model: UserModel,
    filter:{_id: userId},
    select: "phone profilePicture firstName lastName email username"
  })
  if(!profile){
    throw BadRequestException({message:"Fail to find matching profile"})
  }
  if(profile.phone){
    profile.phone = await generateDecryption(profile.phone)
  }
  return profile
}


export const rotateToken = async (user, {jti, iat}, issuer) => {
  if ((iat + ACCESS_EXPIRES_IN) * 1000 >= Date.now() + (30000)) {
    throw ConfilectException({message:"Current access token still valid"})
  }
  await createOne({
    model: tokenModel,
    data: {
      userId: user._id,
      jti,
      expiresIn: new Date((iat + REFRESH_EXPIRES_IN) * 1000)
    }
  })
  return await createLoginCredentials(user, issuer);
};

