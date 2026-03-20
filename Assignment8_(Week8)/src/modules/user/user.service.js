import { users } from "../../DB/models/index.js";
export const profile = (id) => {
  const user = users.find((ele) => ele.id == id);
  return user;
};
