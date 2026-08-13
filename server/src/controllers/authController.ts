import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordMatch = await bcrypt.compare(
      password,
      user?.password ?? "$2b$10$invalidsaltinvalidsaltinvalidsa",
    );

    if (!user || !passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      secret,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const googleCallback = async (req: any, res: Response) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const userParam = encodeURIComponent(JSON.stringify(userData));

    res.redirect(
      `http://localhost:5173/auth/google/success?token=${token}&user=${userParam}`,
    );
  } catch (error) {
    console.error("Google callback error:", error);

    res.redirect("http://localhost:5173/login?error=google");
  }
};
