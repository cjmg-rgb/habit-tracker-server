import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
} from "../controllers/User.controller";

const router = express();

// - /api/users
router.get("/", getUsers);
router.get("/:email", getUser);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;
