import { Router } from "express";
import { profile, updateUser, deleteUser } from "./user.service.js";
import { auth } from "../auth/auth.middleware.js";
const router = Router();

// get logged-in user
router.get("/", auth, async (req, res, next) => {
  try {
    const result = await profile(req.user.userId);
    return res.status(200).json({ message: "Profile", result });
  } catch (e) {
    next(e);
  }
});

// update logged-in user (except password)
router.patch("/", auth, async (req, res, next) => {
  try {
    const result = await updateUser(req.user.userId, req.body);
    return res.status(200).json({ message: "User updated", result });
  } catch (e) {
    next(e);
  }
});

// delete logged-in user
router.delete("/", auth, async (req, res, next) => {
  try {
    const result = await deleteUser(req.user.userId);
    return res.status(200).json({ message: "User deleted", result });
  } catch (e) {
    next(e);
  }
});

export default router;
