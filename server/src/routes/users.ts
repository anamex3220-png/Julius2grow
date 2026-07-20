import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { hashPassword } from "../lib/auth.js";
import { publicUser } from "../lib/serialize.js";
import { computeBalance } from "../domain/vacationRules.js";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { manager: { select: { id: true, name: true } } },
  });
  res.json({ users: users.map(publicUser) });
});

usersRouter.get("/team", requireAuth, requireRole("MANAGER", "ADMIN"), async (req, res) => {
  const users =
    req.user!.role === "ADMIN"
      ? await prisma.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
      : await prisma.user.findMany({
          where: { managerId: req.user!.id, isActive: true },
          orderBy: { name: "asc" },
        });
  res.json({ users: users.map(publicUser) });
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(1),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).default("EMPLOYEE"),
  hireDate: z.coerce.date(),
  residesOutsideMexico: z.boolean().default(false),
  managerId: z.string().nullable().optional(),
});

usersRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }
  const { password, email, ...rest } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: "Ya existe una persona con ese email" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { ...rest, email: email.toLowerCase(), passwordHash },
  });
  res.status(201).json({ user: publicUser(user) });
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).optional(),
  hireDate: z.coerce.date().optional(),
  residesOutsideMexico: z.boolean().optional(),
  managerId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

usersRouter.patch("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }
  if (req.params.id === req.user!.id && parsed.data.role && parsed.data.role !== "ADMIN") {
    return res.status(400).json({ error: "No puedes quitarte tu propio rol de administrador" });
  }

  const { password, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (password) {
    data.passwordHash = await hashPassword(password);
  }

  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ user: publicUser(user) });
});

function canViewBalancesOf(requester: { id: string; role: string }, target: { id: string; managerId: string | null }) {
  return requester.role === "ADMIN" || requester.id === target.id || requester.id === target.managerId;
}

usersRouter.get("/:id/balances", requireAuth, async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "No encontrado" });
  if (!canViewBalancesOf(req.user!, target)) {
    return res.status(403).json({ error: "No tienes permiso para ver este balance" });
  }

  const [approvedRequests, adjustments, holidays] = await Promise.all([
    prisma.leaveRequest.findMany({ where: { userId: target.id, status: "APROBADA" } }),
    prisma.leaveAdjustment.findMany({ where: { userId: target.id } }),
    prisma.holiday.findMany(),
  ]);

  const asOfDate = new Date();
  const vacaciones = computeBalance(target, "VACACIONES", approvedRequests, adjustments, asOfDate);
  const diasPersonales = computeBalance(target, "DIAS_PERSONALES", approvedRequests, adjustments, asOfDate);

  res.json({ vacaciones, diasPersonales, holidaysCount: holidays.length });
});

const adjustmentSchema = z.object({
  type: z.enum(["VACACIONES", "DIAS_PERSONALES"]),
  days: z.number().int(),
  reason: z.string().min(1),
});

usersRouter.post("/:id/adjustments", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = adjustmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "No encontrado" });

  const adjustment = await prisma.leaveAdjustment.create({
    data: { ...parsed.data, userId: target.id, createdById: req.user!.id },
  });
  res.status(201).json({ adjustment });
});
