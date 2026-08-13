import { Router } from "express";
import {
  createPrescription,
  getMyPrescriptions,
  getPendingPrescriptions,
  approvePrescription,
  rejectPrescription,
} from "../controllers/prescriptionController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), createPrescription);

router.get("/my", authenticate, authorize("CUSTOMER"), getMyPrescriptions);

router.get(
  "/pending",
  authenticate,
  authorize("PHARMACIST"),
  getPendingPrescriptions,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("PHARMACIST"),
  approvePrescription,
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("PHARMACIST"),
  rejectPrescription,
);

export default router;
