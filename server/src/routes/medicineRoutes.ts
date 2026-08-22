import { Router } from "express";

import {
  getMedicines,
  getMedicineById,
  getMedicinesByCategory,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  updateMedicineStock,
} from "../controllers/medicineController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

// Public routes
router.get("/", getMedicines);
router.get("/category/:categoryId", getMedicinesByCategory);
router.get("/:id", getMedicineById);

// Admin-only routes
router.post("/", authenticate, authorize("ADMIN"), createMedicine);
router.put("/:id", authenticate, authorize("ADMIN"), updateMedicine);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteMedicine);
router.patch(
  "/:id/stock",
  authenticate,
  authorize("ADMIN"),
  updateMedicineStock,
);

export default router;
