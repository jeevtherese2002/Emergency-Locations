import bcrypt from "bcrypt";
import User from "../models/User.js";
import Admin from '../models/Admin.js';
import { hashPassword } from "../utils/hashPassword.js";
import { generateToken } from "../middleware/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Try to find user first
        let user = await User.findOne({ email });
        let role = "user";

        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const profileComplete = user.profileCompleted || false;

        const token = generateToken(user._id, role);
        res.status(200).json({
            token,
            role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.profilePic || null,
                profileComplete
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      token,
      role: 'admin',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Admin login failed", error: err.message });
  }
};