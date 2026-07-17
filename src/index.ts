import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import { getUploadsDir } from "./lib/uploads-dir.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";
import uploadRoutes from "./routes/upload.js";
import { startTelegramBot } from "./bot/index.js";

async function main() {
  await connectDb();

  const app = express();

  const allowedOrigins = env.corsOrigin.split(",").map((o) => o.trim());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        // В разработке разрешаем localhost и 127.0.0.1 на любом порту
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use("/uploads", express.static(getUploadsDir()));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "ods-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api", apiRoutes);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  if (!process.env.VERCEL) {
    startTelegramBot();
  } else {
    console.log("Telegram bot skipped on Vercel (use a separate worker for polling)");
  }

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
