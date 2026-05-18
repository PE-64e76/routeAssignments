import { model } from "mongoose";
import { providerEnum } from "../../common/enums/user.enum.js";
import {ConfilectException , NotFoundException} from "../../common/utils/response/error.response.js";
import { UserModel, create, createOne, findOne } from "../../DB/index.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.security.js";
import { encrypt , decrypt } from "../../common/utils/security/encryption.security.js";
import { asymmetricEncrypt, asymmetricDecrypt, generateKeyPair } from "../../common/utils/security/asymmetric.security.js";
import { sendOTPEmail } from "../../common/utils/email/email.service.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;
  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email }
  });
  if (checkUserExist) {
    return ConfilectException({ message: "Email exists" });
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await createOne({
    model: UserModel,
    data: [{
        username,
        email,
        password: await generateHash(password, undefined),
        phone: await encrypt(phone),
        provider: providerEnum.System,
        otp: await generateHash(otp, undefined),
        otpExpires
      }]
  });

  try {
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
  }

  return {
    user,
    message: "Signup successful. Please check your email for OTP verification."
  };
};

export const verifyOTP = async (inputs) => {
  const { email, otp } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email }
  });

  if (!user) {
    return NotFoundException({ message: "User not found" });
  }

  if (!user.otp || !user.otpExpires) {
    return NotFoundException({ message: "No OTP found for this user" });
  }

  if (new Date() > user.otpExpires) {
    return ConfilectException({ message: "OTP has expired" });
  }

  const match = await compareHash(otp, user.otp);
  if (!match) {
    return NotFoundException({ message: "Invalid OTP" });
  }

  user.confirmEmail = new Date();
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return {
    message: "Email verified successfully",
    verified: true
  };
};

export const login = async (inputs) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.System },
    // select: '-password'
  });
  if (!user) {
    return NotFoundException({ message: "Invalid login data" });
  }
  const match = await compareHash(password, user.password);
  if (!match) {
    return NotFoundException({ message: "Invalid login data" });
  }
  user.phone = await decrypt(user.phone)
  return user;
};

export const encryptDataAsymmetric = async (inputs) => {
  const { data, publicKey } = inputs;
  
  if (!publicKey) {
    const keyPair = generateKeyPair();
    const encryptedData = asymmetricEncrypt(data, keyPair.publicKey);
    return {
      encryptedData,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      message: "Data encrypted with generated key pair"
    };
  }

  const encryptedData = asymmetricEncrypt(data, publicKey);
  return {
    encryptedData,
    message: "Data encrypted successfully"
  };
};

export const decryptDataAsymmetric = async (inputs) => {
  const { encryptedData, privateKey } = inputs;
  
  const decryptedData = asymmetricDecrypt(encryptedData, privateKey);
  return {
    decryptedData,
    message: "Data decrypted successfully"
  };
};
