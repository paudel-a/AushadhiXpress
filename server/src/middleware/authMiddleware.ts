import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type UserRole = "CUSTOMER" | "ADMIN" | "PHARMACIST";

interface AuthPayload {
  userId: number;
  role: UserRole;
}

// Note: named `auth` (not `user`) to avoid colliding with the global
// `Express.Request.user` type declared by @types/passport.
export interface AuthRequest extends Request {
  auth?: AuthPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not defined");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded) ||
      !("role" in decoded)
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    const payload = decoded as {
      userId: unknown;
      role: unknown;
    };

    if (
      typeof payload.userId !== "number" ||
      !["CUSTOMER", "ADMIN", "PHARMACIST"].includes(payload.role as string)
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    req.auth = {
      userId: payload.userId,
      role: payload.role as UserRole,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
