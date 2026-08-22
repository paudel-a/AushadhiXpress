import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";

type UserRole = "CUSTOMER" | "ADMIN" | "PHARMACIST";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};
