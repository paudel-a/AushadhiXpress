import type { Response } from "express";
import prisma from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const parseCoordinate = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { items, shippingAddress, phone, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item" });
    }
    if (!shippingAddress || !phone) {
      return res
        .status(400)
        .json({ message: "Shipping address and phone are required" });
    }

    // Validate stock and compute total server-side (never trust client prices)
    let totalAmount = 0;
    const orderItemsData: {
      medicineId: number;
      quantity: number;
      price: number;
    }[] = [];

    // Looked up at most once, and only if an item needs a prescription
    let hasApprovedPrescription: boolean | null = null;

    for (const item of items) {
      const medicineId = Number(item.medicineId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(medicineId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({ message: "Invalid item in order" });
      }

      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineId },
      });
      if (!medicine) {
        return res
          .status(404)
          .json({ message: `Medicine ${medicineId} not found` });
      }
      if (medicine.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${medicine.name}. Only ${medicine.stock} left.`,
        });
      }

      // Prescription check
      if (medicine.requiresPrescription) {
        if (hasApprovedPrescription === null) {
          const approved = await prisma.prescription.findFirst({
            where: { userId, status: "APPROVED" },
            select: { id: true },
          });
          hasApprovedPrescription = approved !== null;
        }

        if (!hasApprovedPrescription) {
          return res.status(403).json({
            message: `${medicine.name} requires an approved prescription before it can be ordered.`,
          });
        }
      }

      const price = Number(medicine.price);
      totalAmount += price * quantity;
      orderItemsData.push({ medicineId, quantity, price });
    }

    // Create order + decrement stock in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress,
          phone,
          paymentMethod: paymentMethod === "ONLINE" ? "ONLINE" : "COD",
          latitude: parseCoordinate(req.body.latitude),
          longitude: parseCoordinate(req.body.longitude),
          items: {
            create: orderItemsData,
          },
        },
        include: { items: { include: { medicine: true } } },
      });

      for (const item of orderItemsData) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { medicine: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getAllOrders = async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
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
    });

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};
