import { Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinaryUpload";

const MAX_REJECTION_REASON_LENGTH = 1000;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const createPrescription = async (req: AuthRequest, res: Response) => {
  let publicId: string | undefined;

  try {
    if (!req.auth) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const medicineId = Number(req.body.medicineId);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return res.status(400).json({
        message: "Valid medicine ID is required",
      });
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    if (!medicine.requiresPrescription) {
      return res.status(400).json({
        message: "This medicine does not require a prescription",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Prescription file is required",
      });
    }

    if (!ALLOWED_FILE_TYPES.includes(req.file.mimetype)) {
      return res.status(415).json({
        message: "Only JPEG, PNG, or PDF files are allowed",
      });
    }

    const uploadedFile = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
    );

    publicId = uploadedFile.public_id;

    const prescription = await prisma.prescription.create({
      data: {
        userId: req.auth.userId,
        medicineId,
        documentUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
      },
    });

    return res.status(201).json({
      message: "Prescription uploaded successfully",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    if (publicId) {
      await deleteFromCloudinary(publicId).catch((e) =>
        console.error("Cloudinary cleanup failed:", e),
      );
    }

    return res.status(500).json({
      message: "Failed to upload prescription",
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
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
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
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
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

    const result = await prisma.prescription.updateMany({
      where: {
        id,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
        pharmacistId: req.auth!.userId,
        rejectionReason: null,
      },
    });

    if (result.count === 0) {
      const existing = await prisma.prescription.findUnique({
        where: { id },
      });

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
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pharmacist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

    const result = await prisma.prescription.updateMany({
      where: {
        id,
        status: "PENDING",
      },
      data: {
        status: "REJECTED",
        pharmacistId: req.auth!.userId,
        rejectionReason: trimmedReason,
      },
    });

    if (result.count === 0) {
      const existing = await prisma.prescription.findUnique({
        where: { id },
      });

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
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        pharmacist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
