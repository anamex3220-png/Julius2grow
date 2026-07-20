export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type LeaveType = "VACACIONES" | "DIAS_PERSONALES" | "INCAPACIDAD";
export type LeaveStatus = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "CANCELADA";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  hireDate: string;
  residesOutsideMexico: boolean;
  isActive: boolean;
  managerId: string | null;
  manager?: { id: string; name: string } | null;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  type: LeaveType;
  startDate: string;
  endDate: string;
  businessDays: number;
  note: string | null;
  status: LeaveStatus;
  approverId: string | null;
  approvedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
}

export interface BalanceResult {
  type: LeaveType;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  entitlement: number;
  used: number;
  adjusted: number;
  remaining: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  VACACIONES: "Vacaciones",
  DIAS_PERSONALES: "Días personales",
  INCAPACIDAD: "Incapacidad",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Empleado",
  MANAGER: "Manager",
  ADMIN: "RH / Admin",
};
