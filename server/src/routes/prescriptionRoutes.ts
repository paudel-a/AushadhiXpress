import { Router } from "express";
import upload from "../middleware/uploadMiddleware";

import {
  createPrescription,
  getMyPrescriptions,
  getPendingPrescriptions,
  approvePrescription,
  rejectPrescription,
} from "../controllers/prescriptionController";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

// ============================================
// CUSTOMER ROUTES
// ============================================

// Submit a prescription
router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  upload.single("prescription"),
  createPrescription,
);

// Get prescriptions submitted by the logged-in customer
router.get("/my", authenticate, authorize("CUSTOMER"), getMyPrescriptions);

// ============================================
// PHARMACIST ROUTES
// ============================================

// Get all pending prescriptions
router.get(
  "/pending",
  authenticate,
  authorize("PHARMACIST"),
  getPendingPrescriptions,
);

// Approve a prescription
router.patch(
  "/:id/approve",
  authenticate,
  authorize("PHARMACIST"),
  approvePrescription,
);

// Reject a prescription
router.patch(
  "/:id/reject",
  authenticate,
  authorize("PHARMACIST"),
  rejectPrescription,
);

export default router;
