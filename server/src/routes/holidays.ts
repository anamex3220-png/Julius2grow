import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const holidaysRouter = Router();

holidaysRouter.get("/", requireAuth, async (_req, res) => {
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
  res.json({ holidays });
});

const createSchema = z.object({
  date: z.coerce.date(),
  name: z.string().min(1),
});

holidaysRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos de feriado inválidos" });
  }
  const holiday = await prisma.holiday.create({ data: parsed.data });
  res.status(201).json({ holiday });
});

holidaysRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.holiday.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
