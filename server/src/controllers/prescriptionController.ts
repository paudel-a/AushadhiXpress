import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({
        message: "Prescription document URL is required",
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        userId: req.user!.userId,
        documentUrl,
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
    const prescriptions = await prisma.prescription.findMany({
      where: {
        userId: req.user!.userId,
      },
      orderBy: {
        createdAt: "desc",
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
  _req: AuthRequest,
  res: Response,
) => {
  try {
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
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });
    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }
    if (prescription.status !== "PENDING") {
      return res.status(400).json({
        message: "Prescription has already been reviewed",
      });
    }
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: "APPROVED",
        pharmacistId: req.user!.userId,
        rejectionReason: null,
      },
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
    if (!rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });
    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }
    if (prescription.status !== "PENDING") {
      return res.status(400).json({
        message: "Prescription has already been reviewed",
      });
    }
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: "REJECTED",
        pharmacistId: req.user!.userId,
        rejectionReason,
      },
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
