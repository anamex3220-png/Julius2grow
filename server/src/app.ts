import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { holidaysRouter } from "./routes/holidays.js";
import { requestsRouter } from "./routes/requests.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/holidays", holidaysRouter);
  app.use("/api/requests", requestsRouter);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  if (process.env.NODE_ENV === "production") {
    const clientDist = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
  }

  return app;
}
