import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// INIT
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARES
app.use(express.json());
app.use(cors({ credentials: true }));
app.use(morgan("dev"));

// Routes
app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

// Connection
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
