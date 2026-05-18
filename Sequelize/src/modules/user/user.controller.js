import { Router } from "express";
import * as userService from "./user.service.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const result = await userService.signup(req.body);
    if (result.exists) {
      return res.status(400).json({ message: "Email already exists." });
    }
    return res.status(201).json({ message: "User added successfully." });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await userService.createOrUpdateUser(req.params.id, req.body);
    return res.status(200).json({ message: "User created or updated successfully" });
  } catch (error) {
    return next(error);
  }
});

router.get("/by-email", async (req, res, next) => {
  try {
    const email = req.query.email;
    const result = await userService.findUserByEmail(email);
    if (!result) {
      return res.status(404).json({ message: "no user found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await userService.getUserByIdExcludeRole(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "no user found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
