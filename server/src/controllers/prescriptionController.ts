import { Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const MAX_REJECTION_REASON_LENGTH = 1000;

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { documentUrl } = req.body;
    const trimmedUrl =
      typeof documentUrl === "string" ? documentUrl.trim() : "";

    if (!trimmedUrl || !isValidHttpUrl(trimmedUrl)) {
      return res.status(400).json({
        message: "A valid prescription document URL is required",
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        userId: req.auth!.userId,
        documentUrl: trimmedUrl,
      },
    });

    return res.status(201).json({
      message: "Prescription submitted successfully",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(500).json({
      message: "Failed to submit prescription",
    });
  }
};

export const getMyPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(req.query.pageSize) || 20),
    );

    const prescriptions = await prisma.prescription.findMany({
      where: {
        userId: req.auth!.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        pharmacist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return res.status(500).json({
      message: "Failed to fetch prescriptions",
    });
  }
};

export const getPendingPrescriptions = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(req.query.pageSize) || 20),
    );

    const prescriptions = await prisma.prescription.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Get pending prescriptions error:", error);

    return res.status(500).json({
      message: "Failed to fetch pending prescriptions",
    });
  }
};

export const approvePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid prescription ID",
      });
    }

    // Atomic guarded update: only succeeds if the row is still PENDING,
    // preventing a race between two reviewers approving/rejecting at once.
    const result = await prisma.prescription.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "APPROVED",
        pharmacistId: req.auth!.userId,
        rejectionReason: null,
      },
    });

    if (result.count === 0) {
      const existing = await prisma.prescription.findUnique({ where: { id } });

      if (!existing) {
        return res.status(404).json({
          message: "Prescription not found",
        });
      }

      return res.status(400).json({
        message: "Prescription has already been reviewed",
      });
    }

    const updatedPrescription = await prisma.prescription.findUnique({
      where: { id },
    });

    return res.status(200).json({
      message: "Prescription approved successfully",
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.error("Approve prescription error:", error);

    return res.status(500).json({
      message: "Failed to approve prescription",
    });
  }
};

export const rejectPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { rejectionReason } = req.body;
    const trimmedReason =
      typeof rejectionReason === "string" ? rejectionReason.trim() : "";

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid prescription ID",
      });
    }

    if (!trimmedReason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    if (trimmedReason.length > MAX_REJECTION_REASON_LENGTH) {
      return res.status(400).json({
        message: `Rejection reason must be ${MAX_REJECTION_REASON_LENGTH} characters or fewer`,
      });
    }

    // Same atomic-guard pattern as approvePrescription.
    const result = await prisma.prescription.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "REJECTED",
        pharmacistId: req.auth!.userId,
        rejectionReason: trimmedReason,
      },
    });

    if (result.count === 0) {
      const existing = await prisma.prescription.findUnique({ where: { id } });

      if (!existing) {
        return res.status(404).json({
          message: "Prescription not found",
        });
      }

      return res.status(400).json({
        message: "Prescription has already been reviewed",
      });
    }

    const updatedPrescription = await prisma.prescription.findUnique({
      where: { id },
    });

    return res.status(200).json({
      message: "Prescription rejected successfully",
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.error("Reject prescription error:", error);

    return res.status(500).json({
      message: "Failed to reject prescription",
    });
  }
};
