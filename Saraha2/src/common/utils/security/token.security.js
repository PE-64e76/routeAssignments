import jwt from "jsonwebtoken";
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN, System_REFRESH_TOKEN_SECRET_KEY, System_TOKEN_SECRET_KEY, User_REFRESH_TOKEN_SECRET_KEY, User_TOKEN_SECRET_KEY } from "../../../../config/config.service.js";
import { roleEnum } from "../../enums/user.enum.js";
import { audienceEnum, tokenTypeEnum } from "../../enums/security.enum.js";
import { BadRequestException, UnauthorizedException } from "../response/error.response.js";
import { findOne } from "../../../DB/database.service.js";
import { UserModel } from "../../../DB/index.js";

export const generateToken = async ({
  payload = {},
  secret = User_TOKEN_SECRET_KEY,
  options = {},
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({
  token,
  secret = User_TOKEN_SECRET_KEY,
} = {}) => {
  return jwt.verify(token, secret);
};

export const getTokenSignature = async (role) => {
  let accessSignature = undefined;
  let refreshSignature = undefined;
  let audience = audienceEnum.User 
  switch (role) {
    case roleEnum.Admin:
      accessSignature = System_TOKEN_SECRET_KEY;
      refreshSignature = System_REFRESH_TOKEN_SECRET_KEY;
      audience = audienceEnum.System
      break;
    default:
      accessSignature = User_TOKEN_SECRET_KEY;
      refreshSignature = User_REFRESH_TOKEN_SECRET_KEY;
      audience = audienceEnum.User
      break;
  }
  return {accessSignature, refreshSignature, audience}
};

export const getSignatureLevel = async (audienceType) => {
  let signatureLevel = audienceEnum.User; 
  switch (audienceType) {
    case audienceEnum.System:
      signatureLevel = roleEnum.Admin 
      break;
    default:
      signatureLevel = roleEnum.User
      break;
  }
  return signatureLevel
};

export const createLoginCredentials = async (user, issuer) => {
  
  const {accessSignature, refreshSignature, audience} = await getTokenSignature(user.role)

  const access_token = await generateToken({
    payload:{sub: user._id},
    secret: accessSignature,
    options:{
      issuer,
      audience: [tokenTypeEnum.access, audience],
      expiresIn: ACCESS_EXPIRES_IN
    }
  })
  const refresh_token = await generateToken({
    payload:{sub: user._id},
    secret: refreshSignature,
    options:{
      issuer,
      audience: [tokenTypeEnum.refresh, audience],
      expiresIn: REFRESH_EXPIRES_IN
    }
  })
  return {access_token, refresh_token}
}

export const decodeToken = async ({token, tokenType=tokenTypeEnum.access}={}) => {

  const decode = jwt.decode(token)
  console.log({decode});
  if (!decode?.aud?.length) {
    throw BadRequestException ({message:'Fail ro decoded this token audience is required'})
  }

  const [decodeTokenType, audienceType ] = decode.aud;
  if (decodeTokenType !== tokenType) {
    throw BadRequestException({message: `Invalid token type, token of type ${decodeTokenType} cannot access this api while we excpected token of type ${tokenType}`})
  }
  
  const signatureLevel = await getSignatureLevel(audienceType)
  const {accessSignature, refreshSignature} = await getTokenSignature(signatureLevel)
  console.log({accessSignature, refreshSignature});

  const verifiedData = await verifyToken({
    token, 
    secret: tokenType == tokenTypeEnum.refresh ? refreshSignature : accessSignature
  })

  const user = await findOne({model:UserModel, filter:{_id:verifiedData.sub}})
  if (!user) {
    throw UnauthorizedException({message: `Not register account`})
  }
  return user  
}