import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @GET - /api/users
const getUsers = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          include: {
            groups: true,
            habits: true,
            userStats: {
              select: {
                totalGroups: true,
                totalHabits: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @GET - /api/users/:email
const getUser = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (!userExists) {
      res.status(400).json({
        success: false,
        message: "That user does not exist",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            groups: true,
            habits: true,
            userStats: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @POST - /api/users
const createUser = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password, ...rest } = req.body;

    if (
      !email ||
      !password ||
      !rest.gender ||
      !rest.firstName ||
      !rest.lastName
    ) {
      res.status(400).json({
        success: false,
        message: "Please fill in all fields!",
      });
      return;
    }

    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      res.status(400).json({
        success: false,
        message: "Email already in use!",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            firstName: rest.firstName,
            lastName: rest.lastName,
            gender: rest.gender,
            role: rest.role,
            userStats: {
              create: {
                totalGroups: 0,
                totalHabits: 0,
              },
            },
          },
        },
      },
    });

    if (!process.env.JWT_SECRET) {
      res.status(400).json({
        success: false,
        message: "Please check your env for jwt secrets",
      });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @DELETE - /api/users/:id
const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryId = Number(id);

    const userExists = await prisma.user.findUnique({
      where: { id: queryId },
    });

    if (!userExists) {
      res.status(400).json({
        success: false,
        message: "That user does not exist",
      });
      return;
    }

    const checkRole = await prisma.user.findUnique({
      where: { id: queryId },
      include: {
        profile: {
          select: {
            role: true,
          },
        },
      },
    });

    if (checkRole?.profile?.role === "ADMIN") {
      res.status(400).json({
        success: false,
        message: "ADMIN cannot be deleted",
      });
      return;
    }

    await prisma.user.delete({
      where: { id: queryId },
    });

    res.status(200).json({
      success: true,
      message: "User Deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export { getUsers, createUser, deleteUser, getUser };
