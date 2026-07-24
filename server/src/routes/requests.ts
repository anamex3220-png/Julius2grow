import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { computeBalance, countBusinessDays, toUtcDateOnly } from "../domain/vacationRules.js";

export const requestsRouter = Router();

const createRequestSchema = z
  .object({
    type: z.enum(["VACACIONES", "DIAS_PERSONALES", "INCAPACIDAD"]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    note: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "La fecha de fin no puede ser anterior a la fecha de inicio",
    path: ["endDate"],
  });

requestsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" });
  }
  const { type, startDate, endDate, note } = parsed.data;

  const holidays = await prisma.holiday.findMany();
  const businessDays = countBusinessDays(startDate, endDate, holidays);
  if (businessDays <= 0) {
    return res.status(400).json({ error: "El rango seleccionado no tiene días hábiles" });
  }

  let warning: string | undefined;
  if (type !== "INCAPACIDAD") {
    const [approvedRequests, adjustments] = await Promise.all([
      prisma.leaveRequest.findMany({ where: { userId: req.user!.id, status: "APROBADA" } }),
      prisma.leaveAdjustment.findMany({ where: { userId: req.user!.id } }),
    ]);
    const balance = computeBalance(req.user!, type, approvedRequests, adjustments, startDate);
    if (businessDays > balance.remaining) {
      warning = `Esta solicitud (${businessDays} días) excede el balance disponible del periodo (${balance.remaining} días).`;
    }
  }

  const request = await prisma.leaveRequest.create({
    data: {
      userId: req.user!.id,
      type,
      startDate: toUtcDateOnly(startDate),
      endDate: toUtcDateOnly(endDate),
      businessDays,
      note,
    },
  });

  res.status(201).json({ request, warning });
});

requestsRouter.get("/mine", requireAuth, async (req, res) => {
  const requests = await prisma.leaveRequest.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ requests });
});

requestsRouter.get("/pending-approvals", requireAuth, requireRole("MANAGER", "ADMIN"), async (req, res) => {
  const where =
    req.user!.role === "ADMIN"
      ? { status: "PENDIENTE" as const, user: { managerId: null, id: { not: req.user!.id } } }
      : { status: "PENDIENTE" as const, user: { managerId: req.user!.id } };

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ requests });
});

requestsRouter.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const statusFilter = typeof req.query.status === "string" ? req.query.status : undefined;
  const requests = await prisma.leaveRequest.findMany({
    where: statusFilter ? { status: statusFilter as never } : undefined,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ requests });
});

const decisionSchema = z.object({
  decision: z.enum(["APROBADA", "RECHAZADA"]),
  decisionNote: z.string().optional(),
});

requestsRouter.patch("/:id/decision", requireAuth, requireRole("MANAGER", "ADMIN"), async (req, res) => {
  const parsed = decisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Decisión inválida" });
  }

  const request = await prisma.leaveRequest.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
  if (request.status !== "PENDIENTE") {
    return res.status(400).json({ error: "Esta solicitud ya fue resuelta" });
  }

  const isOwnReport = request.user.managerId === req.user!.id;
  const isEscalatedToAdmin = req.user!.role === "ADMIN" && request.user.managerId === null;
  const isAdminOverride = req.user!.role === "ADMIN";
  if (!isOwnReport && !isEscalatedToAdmin && !isAdminOverride) {
    return res.status(403).json({ error: "No puedes decidir sobre esta solicitud" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: request.id },
    data: {
      status: parsed.data.decision,
      decisionNote: parsed.data.decisionNote,
      approverId: req.user!.id,
      approvedAt: new Date(),
    },
  });

  res.json({ request: updated });
});

requestsRouter.patch("/:id/cancel", requireAuth, async (req, res) => {
  const request = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });
  if (request.userId !== req.user!.id) {
    return res.status(403).json({ error: "No puedes cancelar esta solicitud" });
  }
  if (request.status !== "PENDIENTE") {
    return res.status(400).json({ error: "Solo se pueden cancelar solicitudes pendientes" });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: request.id },
    data: { status: "CANCELADA" },
  });
  res.json({ request: updated });
});
