import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

// Customer
router.post("/", authenticate, createOrder);

router.get("/my-orders", authenticate, getMyOrders);

// Admin
router.get("/all", authenticate, authorize("ADMIN"), getAllOrders);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateOrderStatus,
);

export default router;
