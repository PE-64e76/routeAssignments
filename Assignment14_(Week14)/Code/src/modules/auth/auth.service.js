
import { providerEnum } from "../../common/enums/user.enum.js";
import { BadRequestException, ConfilectException, NotFoundException } from "../../common/utils/response/error.response.js";
import { UserModel, create, createOne, findOne, updateOne } from "../../DB/index.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.security.js";
import { encrypt } from "../../common/utils/security/encryption.security.js";
import { createLoginCredentials } from "../../common/utils/security/token.security.js";
import { OAuth2Client } from 'google-auth-library';
import { CLIENT_IDS } from "../../../config/config.service.js";
import { createNumberOtp, emailEmitter, emailTemplate, sendEmail } from "../../common/utils/index.js";
import { deleteKey, forgetPasswordBlockKey, forgetPasswordMaxRequestKey, forgetPasswordOtpKey, get, increment, keys, loginBlockKey, loginFailedAttemptKey, otpBlockKey, otpKey, otpMaxRequestKey, set, ttl, twoStepEnableBlockKey, twoStepEnableMaxRequestKey, twoStepEnableOtpKey, twoStepLoginKey, twoStepLoginOtpKey } from "../../common/services/index.js";
import { randomUUID } from "crypto";

const generateAndSendConfirmEmailOtp = async (email) => {
  
  // Check block condition
  const blockKey = otpBlockKey(email)
  const remainingBlockTime = await ttl(blockKey) 
  if (remainingBlockTime > 0) {
    throw ConfilectException({message:`You have reached max trial count please try again after ${remainingBlockTime} seconds`})
  }
  
  // Check max trial count 
  const maxTrialCountKey = otpMaxRequestKey(email)
  const checkMaxOtpRequest = Number(await get(maxTrialCountKey) || 0)

  
  if (checkMaxOtpRequest >= 3) {
    await set({
      key: otpBlockKey(email),
      value: 0,
      ttl: 300
    })
  
    throw ConfilectException({message:`You have reached max trial count please try again after 300 seconds`})
  }

  const code = await createNumberOtp()
  await set({
    key: otpKey(email),
    value: await generateHash(`${code}`),
    ttl: 120
  })

  checkMaxOtpRequest > 0 ? await increment(maxTrialCountKey) : await set({key:maxTrialCountKey , value: 1, ttl:300})

  emailEmitter.emit("Confirm-Email", {to:email, subject: "Confirm-Email", code, title: "Confirm-Email"})
  return;
}

const generateAndSendTwoStepEnableOtp = async (email) => {
  
  const blockKey = twoStepEnableBlockKey(email)
  const remainingBlockTime = await ttl(blockKey) 
  if (remainingBlockTime > 0) {
    throw ConfilectException({message:`You have reached max trial count please try again after ${remainingBlockTime} seconds`})
  }
  
  const maxTrialCountKey = twoStepEnableMaxRequestKey(email)
  const checkMaxOtpRequest = Number(await get(maxTrialCountKey) || 0)
  
  if (checkMaxOtpRequest >= 3) {
    await set({
      key: twoStepEnableBlockKey(email),
      value: 0,
      ttl: 300
    })
  
    throw ConfilectException({message:`You have reached max trial count please try again after 300 seconds`})
  }

  const code = await createNumberOtp()
  await set({
    key: twoStepEnableOtpKey(email),
    value: await generateHash(`${code}`),
    ttl: 120
  })

  checkMaxOtpRequest > 0 ? await increment(maxTrialCountKey) : await set({key:maxTrialCountKey , value: 1, ttl:300})

  emailEmitter.emit("Confirm-Email", {to:email, subject: "2-Step Verification", code, title: "2-Step Verification"})
  return;
}

const generateAndSendTwoStepLoginOtp = async ({email, loginId}={}) => {
  
  const code = await createNumberOtp()
  await set({
    key: twoStepLoginOtpKey(loginId),
    value: await generateHash(`${code}`),
    ttl: 120
  })

  await set({
    key: twoStepLoginKey(loginId),
    value: {email},
    ttl: 300
  })

  emailEmitter.emit("Confirm-Email", {to:email, subject: "Login Verification Code", code, title: "Login Verification"})
  return;
}

const generateAndSendForgetPasswordOtp = async (email) => {
  
  const blockKey = forgetPasswordBlockKey(email)
  const remainingBlockTime = await ttl(blockKey) 
  if (remainingBlockTime > 0) {
    throw ConfilectException({message:`You have reached max trial count please try again after ${remainingBlockTime} seconds`})
  }
  
  const maxTrialCountKey = forgetPasswordMaxRequestKey(email)
  const checkMaxOtpRequest = Number(await get(maxTrialCountKey) || 0)
  
  if (checkMaxOtpRequest >= 3) {
    await set({
      key: forgetPasswordBlockKey(email),
      value: 0,
      ttl: 300
    })
  
    throw ConfilectException({message:`You have reached max trial count please try again after 300 seconds`})
  }

  const code = await createNumberOtp()
  await set({
    key: forgetPasswordOtpKey(email),
    value: await generateHash(`${code}`),
    ttl: 120
  })

  checkMaxOtpRequest > 0 ? await increment(maxTrialCountKey) : await set({key:maxTrialCountKey , value: 1, ttl:300})

  emailEmitter.emit("Confirm-Email", {to:email, subject: "Reset Password", code, title: "Reset Password"})
  return;
}

export const signup = async (inputs) => {
  const { username, email, password, phone } = inputs;

  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email }
  })
  if (checkUserExist) {
    throw ConfilectException({ message: "Email exist" })
  }

  const user = await createOne({
    model: UserModel,
    data: {
      username,
      email,
      password: await generateHash(password),
      phone: await encrypt(phone),
      confirmEmailExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  
  await generateAndSendConfirmEmailOtp(email)

  return user;
};

export const confirmEmail = async (inputs) => {
  
  const { email, otp } = inputs;

  const account = await findOne({
    model: UserModel,
    filter: { email , confirmEmail:{$exists: false}, provider:providerEnum.System}
  })
  if (!account) {
    throw NotFoundException({ message: "Fail to find account" })
  }

  const hashOtp = await get(otpKey(email))
  if (!hashOtp) {
    throw NotFoundException({message:"Expired otp"})
  }
  if (!await compareHash(otp, hashOtp)) {
    throw ConfilectException({message:"Invalid otp"})
  }
  
  account.confirmEmail = new Date();
  account.confirmEmailExpiresAt = undefined;
  await account.save()

  await deleteKey(await keys(otpKey(email)))
  return ;
};

export const reSendConfirmEmail = async (inputs) => {
  const { email } = inputs;

  const account = await findOne({
    model: UserModel,
    filter: { email , confirmEmail:{$exists: false}, provider:providerEnum.System}
  })
  if (!account) {
    throw NotFoundException({ message: "Fail to find matching account" })
  }

  const remainingTime = await ttl(otpKey(email))
  if (remainingTime > 0) {
    throw ConfilectException({message:`Sorry we can't provide new otp untill the exits one is expired, please try again after ${remainingTime}`})
  }
  
  await generateAndSendConfirmEmailOtp(email)

  return ;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.System },
  });
  if (!user) {
    throw NotFoundException({ message: "Invalid login data" });
  }

  const remainingBlockTime = await ttl(loginBlockKey(email))
  if (remainingBlockTime > 0) {
    throw ConfilectException({message:`Your account is temporarily banned please try again after ${remainingBlockTime} seconds`})
  }

  const match = await compareHash(password, user.password);
  if (!match) {
    
    const failedAttemptKey = loginFailedAttemptKey(email)
    const currentAttempt = Number(await get(failedAttemptKey) || 0)
    if (!currentAttempt) {
      await set({key:failedAttemptKey, value: 1, ttl: 300})
    } else {
      await increment(failedAttemptKey)
    }
    
    const updatedAttempt = Number(await get(failedAttemptKey) || 0)
    if (updatedAttempt >= 5) {
      await set({key: loginBlockKey(email), value: 0, ttl: 300})
      await deleteKey([failedAttemptKey])
      throw ConfilectException({message:`Your account is temporarily banned please try again after 300 seconds`})
    }
    throw NotFoundException({ message: "Invalid login data" });
  }

  await deleteKey([loginFailedAttemptKey(email), loginBlockKey(email)])
  
  if (user.twoStepVerification) {
    const loginId = randomUUID()
    await generateAndSendTwoStepLoginOtp({email, loginId})
    return {twoStepVerificationRequired:true, loginId}
  }

  return await createLoginCredentials(user, issuer);
};

export const loginConfirmation = async (inputs, issuer) => {
  const { loginId, otp } = inputs;
  
  const loginSession = await get(twoStepLoginKey(loginId))
  if (!loginSession?.email) {
    throw NotFoundException({message:"Expired login session"})
  }

  const hashOtp = await get(twoStepLoginOtpKey(loginId))
  if (!hashOtp) {
    throw NotFoundException({message:"Expired otp"})
  }
  if (!await compareHash(otp, hashOtp)) {
    throw ConfilectException({message:"Invalid otp"})
  }

  const user = await findOne({
    model: UserModel,
    filter: { email: loginSession.email, provider: providerEnum.System },
  });
  if (!user) {
    throw NotFoundException({ message: "Fail to find matching account" });
  }

  await deleteKey([twoStepLoginKey(loginId), twoStepLoginOtpKey(loginId)])
  return await createLoginCredentials(user, issuer);
}

export const enableTwoStepVerification = async (user) => {
  if (user.twoStepVerification) {
    throw ConfilectException({message:"2-step-verification already enabled"})
  }
  await generateAndSendTwoStepEnableOtp(user.email)
  return ;
}

export const verifyTwoStepVerification = async (inputs, user) => {
  
  const { otp } = inputs;

  if (user.twoStepVerification) {
    throw ConfilectException({message:"2-step-verification already enabled"})
  }

  const hashOtp = await get(twoStepEnableOtpKey(user.email))
  if (!hashOtp) {
    throw NotFoundException({message:"Expired otp"})
  }
  if (!await compareHash(otp, hashOtp)) {
    throw ConfilectException({message:"Invalid otp"})
  }

  user.twoStepVerification = true;
  await user.save()

  await deleteKey(await keys(twoStepEnableOtpKey(user.email)))
  return ;
}

export const updatePassword = async (inputs, user) => {
  const { oldPassword, password } = inputs;
  if (user.provider !== providerEnum.System) {
    throw BadRequestException({message:"This account doesn't have password"})
  }
  const match = await compareHash(oldPassword, user.password);
  if (!match) {
    throw ConfilectException({message:"Invalid old password"})
  }
  user.password = await generateHash(password)
  user.changeCredentialsTime = new Date()
  await user.save()
  return ;
}

export const forgetPassword = async (inputs) => {
  const { email } = inputs;
  
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.System },
  });
  if (!user) {
    throw NotFoundException({ message: "Fail to find matching account" })
  }

  await generateAndSendForgetPasswordOtp(email)
  return ;
}

export const resetPassword = async (inputs) => {
  
  const { email, otp, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.System },
  });
  if (!user) {
    throw NotFoundException({ message: "Fail to find matching account" })
  }

  const hashOtp = await get(forgetPasswordOtpKey(email))
  if (!hashOtp) {
    throw NotFoundException({message:"Expired otp"})
  }
  if (!await compareHash(otp, hashOtp)) {
    throw ConfilectException({message:"Invalid otp"})
  }
  
  user.password = await generateHash(password)
  user.changeCredentialsTime = new Date()
  await user.save()

  await deleteKey(await keys(forgetPasswordOtpKey(email)))
  await deleteKey([loginFailedAttemptKey(email), loginBlockKey(email)])
  return ;
}

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
      profilePicture: payload.picture,
      confirmEmail: new Date(),
      confirmEmailExpiresAt: undefined,
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
