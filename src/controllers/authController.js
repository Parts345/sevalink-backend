import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role,
      skills = [],
      availability = [],
      location,
      ngoName
    } = req.body;

    if (!name || !email || !password || !role) {
      return next(Object.assign(new Error("name, email, password, and role are required"), { statusCode: 400 }));
    }

    if (!["volunteer", "ngo"].includes(role)) {
      return next(Object.assign(new Error("role must be volunteer or ngo"), { statusCode: 400 }));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(Object.assign(new Error("An account with this email already exists"), { statusCode: 409 }));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      skills,
      availability,
      location,
      ngoName
    });

    const token = signToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(Object.assign(new Error("email and password are required"), { statusCode: 400 }));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(Object.assign(new Error("Invalid email or password"), { statusCode: 401 }));
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return next(Object.assign(new Error("Invalid email or password"), { statusCode: 401 }));
    }

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    availability: user.availability,
    location: user.location,
    ngoName: user.ngoName
  };
}
