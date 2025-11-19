import express from "express";
import { signup,login,logout,getUsers } from "../Controllers/AuthController.js";
import { authMiddleware } from "../Controllers/Authmiddleware.js";

const router = express.Router();

router.post("/signup",signup);

router.post("/login", login);

router.post("/logout", logout);
router.get("/getusers", authMiddleware, getUsers);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;