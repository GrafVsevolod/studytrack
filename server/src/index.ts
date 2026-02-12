import cors from "cors";
import { app } from "./app";

const port = Number(process.env.PORT || 4000);

// ✅ CORS: разрешаем и localhost, и 127.0.0.1 (иначе браузер режет запросы)
const allowedOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // для curl/postman origin может быть undefined
      if (!origin) return cb(null, true);
      return cb(null, allowedOrigins.has(origin));
    },
    credentials: true,
  })
);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
});
