import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();

const origin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin,
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);

export { app };
