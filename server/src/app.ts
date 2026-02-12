import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";

dotenv.config();

const app = express();

/**
 * Разрешённые origin:
 * - локальная разработка
 * - прод Netlify
 * - deploy previews Netlify
 * - через env (FRONTEND_URL / FRONTEND_URLS)
 */

const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://warm-taffy-944014.netlify.app", // твой прод Netlify
];

const envOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS?.split(",") ?? []),
]
  .map((s) => s?.trim())
  .filter(Boolean) as string[];

const allowedOrigins = new Set([...devOrigins, ...envOrigins]);

// Разрешаем deploy preview вида:
// https://<hash>--warm-taffy-944014.netlify.app
const isNetlifyPreviewForThisSite = (origin: string) =>
  origin.endsWith(".netlify.app") &&
  origin.includes("--warm-taffy-944014");

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    if (allowedOrigins.has(origin)) return cb(null, true);
    if (isNetlifyPreviewForThisSite(origin)) return cb(null, true);

    // ❗️НЕ кидаем Error — иначе будет 500 на preflight
    return cb(null, false);
  },
  credentials: true,
};

// 🔥 КРИТИЧНО: CORS ДО ВСЕХ РОУТОВ
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);

export { app };
