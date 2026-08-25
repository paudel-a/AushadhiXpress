import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, getMyOrders);

export default router;
