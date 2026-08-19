import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// Get all medicines
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

// Get a single medicine
export const getMedicineById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid medicine ID",
      });
    }

    const medicine = await prisma.medicine.findUnique({
      where: {
        id,
      },
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
    console.error("Get medicine by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch medicine",
    });
  }
};

// Get medicines by category
export const getMedicinesByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
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
      message: "Failed to fetch medicines by category",
    });
  }
};

// Create a medicine
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

    // Required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      price === undefined ||
      categoryId === undefined
    ) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    // Convert numeric values
    const parsedPrice = Number(price);
    const parsedStock = stock === undefined ? 0 : Number(stock);
    const parsedCategoryId = Number(categoryId);

    // Validate price
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    // Validate stock
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        message: "Stock must be a non-negative integer",
      });
    }

    // Validate category ID
    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    // Validate prescription value
    if (
      requiresPrescription !== undefined &&
      typeof requiresPrescription !== "boolean"
    ) {
      return res.status(400).json({
        message: "requiresPrescription must be a boolean",
      });
    }

    // Check category exists
    const category = await prisma.category.findUnique({
      where: {
        id: parsedCategoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Create medicine
    const medicine = await prisma.medicine.create({
      data: {
        name: name.trim(),
        description:
          typeof description === "string" ? description.trim() || null : null,
        price: parsedPrice,
        stock: parsedStock,
        image: typeof image === "string" ? image.trim() || null : null,
        requiresPrescription: requiresPrescription ?? false,
        categoryId: parsedCategoryId,
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
