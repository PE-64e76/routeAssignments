
import { providerEnum } from "../../common/enums/user.enum.js";
import { BadRequestException, ConfilectException, NotFoundException } from "../../common/utils/response/error.response.js";
import { UserModel, create, createOne, findOne, updateOne } from "../../DB/index.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.security.js";
import { encrypt } from "../../common/utils/security/encryption.security.js";
import { createLoginCredentials } from "../../common/utils/security/token.security.js";
import { OAuth2Client } from 'google-auth-library';
import { CLIENT_IDS } from "../../../config/config.service.js";

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const checkUserExist = await findOne({ model: UserModel, filter: { email } });
  if (checkUserExist) {
    return ConfilectException({ message: "Email exists" });
  }

  const user = await createOne({
    model: UserModel,
    data: [
      {
        username,
        email,
        password: await generateHash(password, undefined),
        phone: await encrypt(phone),
        provider: providerEnum.System,
        confirmEmail: new Date(),
      },
    ],
  });

  return user;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.System },
  });
  if (!user) {
    return NotFoundException({ message: "Invalid login data" });
  }
  const match = await compareHash(password, user.password);
  if (!match) {
    return NotFoundException({ message: "Invalid login data" });
  }

  return await createLoginCredentials(user, issuer);
};

const verifyGoogleAccount = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw BadRequestException({ message: "Fail to verify this account with Google" });
  }
  return payload;
};

export const signupWithGmail = async ({ idToken }, issuer) => {
  const payload = await verifyGoogleAccount(idToken);

  const checkUserExist = await findOne({ model: UserModel, filter: { email: payload.email } });
  if (checkUserExist) {
    if (checkUserExist?.provider == providerEnum.System) {
      throw ConfilectException({ message: "Account already exist with different provider" });
    }
    const account = await loginWithGmail({ idToken }, issuer);
    return { account, status: 200 };
  }

  const user = await create({
    model: UserModel,
    data: [{
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      provider: providerEnum.Google,
      profilePic: payload.picture,
      confirmEmail: new Date(),
    }],
  });

  return { account: await createLoginCredentials(user[0], issuer) };
};

export const loginWithGmail = async ({ idToken }, issuer) => {
  const payload = await verifyGoogleAccount(idToken);
  const user = await findOne({ model: UserModel, filter: { email: payload.email, provider: providerEnum.Google } });
  if (!user) {
    throw NotFoundException({ message: "Invalid login data" });
  }
  return await createLoginCredentials(user, issuer);
};
