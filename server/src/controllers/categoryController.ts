import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      message: "Failed to create category",
    });
  }
};
