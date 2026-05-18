import { User } from "../../DB/model/index.js";

export const signup = async (userData) => {
  const existing = await User.findOne({ where: { email: userData.email } });
  if (existing) {
    return { exists: true };
  }
  const user = User.build(userData);
  await user.save();
  return { exists: false };
};

export const createOrUpdateUser = async (id, userData) => {
  await User.upsert({ id: parseInt(id), ...userData }, { validate: false });
};

export const findUserByEmail = async (email) => {
  const user = await User.findOne({
    where: { email },
    attributes: { exclude: ["password"] },
  });
  return user ? user.toJSON() : null;
};

export const getUserByIdExcludeRole = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password", "role"] },
  });
  return user ? user.toJSON() : null;
};
