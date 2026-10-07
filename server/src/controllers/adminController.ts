import type { Response } from "express";

import prisma from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const getAdminDashboard = async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalMedicines,
      pendingPrescriptions,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      prisma.medicine.count(),

      prisma.prescription.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              medicine: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalMedicines,
      pendingPrescriptions,
      recentOrders,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
};
