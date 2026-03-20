import { createLoginCredentials, decodeToken } from "../../common/utils/security/token.security.js";

export const profile = async (user) => {
  return user
};

export const rotateToken = async (user, issuer) => {
  return await createLoginCredentials(user, issuer);
};
