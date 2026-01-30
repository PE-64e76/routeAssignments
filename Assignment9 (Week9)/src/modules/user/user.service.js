import { UserModel } from "../../DB/model/index.js";
import CryptoJS from "crypto-js";

export const profile = async (id) => {
  const user = await UserModel.findById(id);
  return user;
};

export const updateUser = async (id, data) => {
  if (data.email) {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing && existing._id.toString() !== id)
      throw new Error("Email already exists", { cause: { status: 409 } });
  }
  // do not allow password update here
  delete data.password;
  if (data.phone)
    data.phone = CryptoJS.AES.encrypt(
      data.phone,
      process.env.ENCRYPT_KEY,
    ).toString();
  const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
  return user;
};

export const deleteUser = async (id) => {
  const user = await UserModel.findByIdAndDelete(id);
  return user;
};
