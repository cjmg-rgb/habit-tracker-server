import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

// @GET - /api/habits
const getHabits = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const habits = await prisma.habit.findMany({
      include: {
        user: true,
      },
    });

    res.status(200).json({
      success: true,
      data: habits,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @GET - /api/habits/:id
const getUserHabits = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const queryId = Number(id);

      const user = await prisma.user.findUnique({
        where: { id: queryId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: "No user with that ID found",
        });
        return;
      }

      const habits = await prisma.habit.findMany({
        where: { userId: user.id },
      });

      res.status(200).json({
        success: true,
        data: habits,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);

// @POST - /api/habits/:id
const createHabit = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, frequency } = req.body;
    const queryId = Number(id);

    const user = await prisma.user.findUnique({
      where: { id: queryId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "No user with that ID found",
      });
      return;
    }

    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: "Please fill in all fields",
      });
      return;
    }

    const habit = await prisma.$transaction([
      prisma.habit.create({
        data: {
          userId: user.id,
          title,
          description,
          frequency: frequency ? frequency : "DAILY",
        },
      }),
      prisma.userStats.update({
        where: { userId: queryId },
        data: {
          totalHabits: {
            increment: 1,
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: habit[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @DELETE - api/habits/:id
const deleteHabit = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryId = Number(id);

    const habit = await prisma.habit.findUnique({
      where: { id: queryId },
    });

    if (!habit) {
      res.status(400).json({
        success: false,
        message: "No habit with that ID found",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: habit?.userId },
    });

    await prisma.$transaction([
      prisma.habit.delete({
        where: { id: queryId },
      }),
      prisma.userStats.update({
        where: { userId: user?.id },
        data: {
          totalHabits: {
            decrement: 1,
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Habit Deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export { createHabit, deleteHabit, getHabits, getUserHabits };
