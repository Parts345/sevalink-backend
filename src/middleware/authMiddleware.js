import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(Object.assign(new Error("Authorization token is required"), { statusCode: 401 }));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(Object.assign(new Error("User not found"), { statusCode: 401 }));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(Object.assign(new Error("Invalid or expired token"), { statusCode: 401 }));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(Object.assign(new Error("You do not have permission for this action"), { statusCode: 403 }));
    }

    next();
  };
}
