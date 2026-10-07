import { Router } from "express";

import { getAdminDashboard } from "../controllers/adminController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/dashboard", authenticate, authorize("ADMIN"), getAdminDashboard);

export default router;
