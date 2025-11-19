import user from "../models/Usermodel.js";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
dotenv.config();

// signup
// signup
// signup
export async function signup(req, res) {
  const { Fullname, email, password } = req.body;
  console.log("incoming request ",req.body)
  try {
    if (!Fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailregex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // random avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const avatar = `https://avatar.iran.liara.run/public/${idx}`;

    // ✅ don't hash here, let schema pre("save") do it
    const newUser = await user.create({
      Fullname,
      email,
      password,  
      profilePicture: avatar,
    });

    return res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// loginn
export async function login(req, res) {
  console.log("incoming ", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await user.findOne({ email });
    const name  = existingUser.Fullname;
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Include email + name in token
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        name: name, // make sure "name" exists in your schema
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    // ✅ Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "Strict", // use "Lax" if testing with localhost frontend
      secure: process.env.NODE_ENV === "production",
    });

    // ✅ Return user info as well
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.Fullname,
      },
    });
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}



export async function logout(req, res) {
  try {
    console.log("cleared user")
    res.clearCookie("jwt");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await user.find({ _id: { $ne: req.user.id } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};
