import jwt from "jsonwebtoken";
import user from "../models/Usermodel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await user.findById(decoded.id).select("-password");
    if (!foundUser) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = foundUser;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
