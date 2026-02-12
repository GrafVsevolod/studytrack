import cors from "cors";
import { app } from "./app";

const port = Number(process.env.PORT || 4000);

/**
 * CORS:
 * - локальная разработка
 * - прод: добавляешь FRONTEND_URL в Render (и при желании еще FRONTEND_URLS)
 *
 * Render env example:
 * FRONTEND_URL=https://warm-taffy-944014.netlify.app
 * (или твой основной домен Netlify)
 *
 * Можно также:
 * FRONTEND_URLS=https://site1.netlify.app,https://site2.netlify.app
 */
const devOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",

  // 👇 ДОБАВЛЕНО
  "https://warm-taffy-944014.netlify.app",
];

const envOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS?.split(",") ?? []),
]
  .map((s) => s?.trim())
  .filter(Boolean) as string[];

const allowedOrigins = new Set([...devOrigins, ...envOrigins]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (allowedOrigins.has(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked origin: ${origin}`), false);
    },
    credentials: true,
  })
);

app.listen(port, () => {
  console.log(`[server] listening on port ${port}`);
});
