import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

// @POST - /api/auth/login
const login = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please fill in all fields!",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
      return;
    }
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(400).json({
        success: false,
        message: "Invalid secret token, check env",
      });
      return;
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "7d" });
    res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Server Error",
    });
  }
});

export { login };
