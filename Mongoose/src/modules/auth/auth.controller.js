import * as service from "./auth.service.js";
import { Router } from "express";

const router = Router();

export const signup = async (req, res, next) => {
  try {
    const result = await service.signup(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await service.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
};


router.post("/signup", signup);
router.post("/login", login);

export default router;
