import express from "express";
import {
  createHabit,
  deleteHabit,
  getHabits,
  getUserHabits,
} from "../controllers/Habit.controller";

const router = express.Router();

// - api/habits
router.get("/", getHabits);
router.get("/:id", getUserHabits);
router.post("/:id", createHabit);
router.delete("/:id", deleteHabit);

export default router;
