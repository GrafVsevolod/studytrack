import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();

/**
 * Разрешаем оба варианта локального фронта:
 * - http://localhost:5173
 * - http://127.0.0.1:5173
 *
 * А также возможность переопределить через .env
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например curl / Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);

export { app };
