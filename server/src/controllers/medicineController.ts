import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getMedicines = async (_req: Request, res: Response) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(medicines);
  } catch (error) {
    console.error("Get medicines error:", error);

    return res.status(500).json({
      message: "Failed to fetch medicines",
    });
  }
};

export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid medicine ID",
      });
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    return res.status(200).json(medicine);
  } catch (error) {
    console.error("Get medicine error:", error);

    return res.status(500).json({
      message: "Failed to fetch medicine",
    });
  }
};

export const getMedicinesByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.categoryId);

    if (Number.isNaN(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        categoryId,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(medicines);
  } catch (error) {
    console.error("Get medicines by category error:", error);

    return res.status(500).json({
      message: "Failed to fetch medicines",
    });
  }
};
export const createMedicine = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      image,
      requiresPrescription,
      categoryId,
    } = req.body;

    if (!name || price === undefined || categoryId === undefined) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        description,
        price,
        stock: stock ?? 0,
        image,
        requiresPrescription: requiresPrescription ?? false,
        categoryId: Number(categoryId),
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json(medicine);
  } catch (error) {
    console.error("Create medicine error:", error);

    return res.status(500).json({
      message: "Failed to create medicine",
    });
  }
};
