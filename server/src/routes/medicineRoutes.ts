import { Router } from "express";

import {
  getMedicines,
  getMedicineById,
  getMedicinesByCategory,
  createMedicine,
} from "../controllers/medicineController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

// Public routes
router.get("/", getMedicines);
router.get("/category/:categoryId", getMedicinesByCategory);
router.get("/:id", getMedicineById);

// Admin-only route
router.post("/", authenticate, authorize("ADMIN"), createMedicine);

export default router;
