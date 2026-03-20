import { UserModel } from "../../DB/model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

export const signup = async (inputs) => {
  const findUser = await UserModel.findOne({ email: inputs.email });
  if (findUser) {
    throw new Error("Duplicated account", { cause: { status: 409 } });
  }

  inputs.password = await bcrypt.hash(inputs.password, 8);
  inputs.phone = CryptoJS.AES.encrypt(inputs.phone, process.env.ENCRYPT_KEY).toString();

  const user = new UserModel(inputs);
  await user.save();
  return { user };
};

export const login = async ({ email, password }) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Invalid credentials", { cause: { status: 400 } });

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials", { cause: { status: 400 } });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return { token };
};
