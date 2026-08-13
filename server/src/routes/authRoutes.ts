import { Router } from "express";
import {
  login,
  register,
  googleCallback,
} from "../controllers/authController.js";
import { authenticate, AuthRequest } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import passport from "../config/passport.js";
const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login?error=google",
  }),
  googleCallback,
);

export default router;
