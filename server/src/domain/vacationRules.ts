// Reglas de negocio de vacaciones/PTO para Julius.
//
// Todas las fechas se normalizan a medianoche UTC para tratarlas como "días
// calendario" puros y evitar bugs de zona horaria al comparar/iterar fechas.

export type LeaveType = "VACACIONES" | "DIAS_PERSONALES" | "INCAPACIDAD";

export interface HolidayDate {
  date: Date;
}

export interface ServicePeriod {
  /** Fecha de inicio del periodo (inclusive). */
  start: Date;
  /** Fecha de fin del periodo (inclusive). */
  end: Date;
  /** Años completos de antigüedad al iniciar este periodo (0 = primer año). */
  completedYears: number;
}

export function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addYearsUtc(date: Date, years: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUtc(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

/**
 * Devuelve el "año de servicio" (periodo aniversario de 12 meses desde la
 * fecha de contratación) en el que cae `asOfDate`. El periodo 0 es el primer
 * año (desde hireDate hasta el día antes del primer aniversario).
 */
export function currentServicePeriod(hireDate: Date, asOfDate: Date): ServicePeriod {
  const hire = toUtcDateOnly(hireDate);
  const asOf = toUtcDateOnly(asOfDate);

  if (asOf < hire) {
    return { start: hire, end: addDaysUtc(addYearsUtc(hire, 1), -1), completedYears: 0 };
  }

  let completedYears = 0;
  let periodStart = hire;
  while (addYearsUtc(hire, completedYears + 1) <= asOf) {
    completedYears++;
  }
  periodStart = addYearsUtc(hire, completedYears);
  const periodEnd = addDaysUtc(addYearsUtc(hire, completedYears + 1), -1);
  return { start: periodStart, end: periodEnd, completedYears };
}

/**
 * Días de vacaciones según la Ley Federal del Trabajo (México), reforma 2023,
 * dado el número de años completos de antigüedad al iniciar el periodo.
 * Año 1: 12, +2 cada año hasta el año 5 (20), luego +2 cada 5 años.
 */
export function vacationEntitlementMx(completedYears: number): number {
  if (completedYears < 0) return 0;
  if (completedYears <= 4) return 12 + 2 * completedYears;
  const bracket = Math.floor((completedYears - 5) / 5);
  return 22 + 2 * bracket;
}

/** Talento que reside fuera de México: 15 días hábiles fijos, sin importar antigüedad. */
export function vacationEntitlementForeign(): number {
  return 15;
}

export function vacationEntitlement(completedYears: number, residesOutsideMexico: boolean): number {
  return residesOutsideMexico ? vacationEntitlementForeign() : vacationEntitlementMx(completedYears);
}

export interface SemesterPeriod {
  start: Date;
  end: Date;
  label: string;
}

/** Semestre calendario (Ene-Jun o Jul-Dic) al que pertenece `asOfDate`. Los días personales no se acumulan entre semestres. */
export function currentPersonalDaysSemester(asOfDate: Date): SemesterPeriod {
  const d = toUtcDateOnly(asOfDate);
  const year = d.getUTCFullYear();
  if (d.getUTCMonth() < 6) {
    return {
      start: new Date(Date.UTC(year, 0, 1)),
      end: new Date(Date.UTC(year, 5, 30)),
      label: `Enero–Junio ${year}`,
    };
  }
  return {
    start: new Date(Date.UTC(year, 6, 1)),
    end: new Date(Date.UTC(year, 11, 31)),
    label: `Julio–Diciembre ${year}`,
  };
}

export const PERSONAL_DAYS_PER_SEMESTER = 3;

/** Cuenta días hábiles entre start y end (inclusive), excluyendo sábados, domingos y feriados. */
export function countBusinessDays(start: Date, end: Date, holidays: HolidayDate[] = []): number {
  const s = toUtcDateOnly(start);
  const e = toUtcDateOnly(end);
  if (e < s) return 0;

  const holidaySet = new Set(holidays.map((h) => toUtcDateOnly(h.date).toISOString()));

  let count = 0;
  let cursor = s;
  while (cursor <= e) {
    const dow = cursor.getUTCDay();
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidaySet.has(cursor.toISOString());
    if (!isWeekend && !isHoliday) count++;
    cursor = addDaysUtc(cursor, 1);
  }
  return count;
}

export interface RequestForBalance {
  type: LeaveType;
  startDate: Date;
  businessDays: number;
}

export interface AdjustmentForBalance {
  type: LeaveType;
  days: number;
  createdAt: Date;
}

export interface UserForBalance {
  hireDate: Date;
  residesOutsideMexico: boolean;
}

export interface BalanceResult {
  type: LeaveType;
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  entitlement: number;
  used: number;
  adjusted: number;
  remaining: number;
}

/**
 * Calcula el balance vigente de vacaciones o días personales de un usuario.
 * El balance NO se guarda: se deriva de la fórmula de antigüedad/residencia,
 * las solicitudes aprobadas del periodo vigente, y los ajustes manuales de RH
 * del mismo periodo. INCAPACIDAD no tiene balance (no aplica límite).
 */
export function computeBalance(
  user: UserForBalance,
  type: Exclude<LeaveType, "INCAPACIDAD">,
  approvedRequests: RequestForBalance[],
  adjustments: AdjustmentForBalance[],
  asOfDate: Date
): BalanceResult {
  let periodStart: Date;
  let periodEnd: Date;
  let periodLabel: string;
  let entitlement: number;

  if (type === "VACACIONES") {
    const period = currentServicePeriod(user.hireDate, asOfDate);
    periodStart = period.start;
    periodEnd = period.end;
    periodLabel = `Año de servicio ${period.completedYears + 1} (${fmt(period.start)} – ${fmt(period.end)})`;
    entitlement = vacationEntitlement(period.completedYears, user.residesOutsideMexico);
  } else {
    const semester = currentPersonalDaysSemester(asOfDate);
    periodStart = semester.start;
    periodEnd = semester.end;
    periodLabel = semester.label;
    entitlement = PERSONAL_DAYS_PER_SEMESTER;
  }

  const inPeriod = (d: Date) => {
    const x = toUtcDateOnly(d);
    return x >= periodStart && x <= periodEnd;
  };

  const used = approvedRequests
    .filter((r) => r.type === type && inPeriod(r.startDate))
    .reduce((sum, r) => sum + r.businessDays, 0);

  const adjusted = adjustments
    .filter((a) => a.type === type && inPeriod(a.createdAt))
    .reduce((sum, a) => sum + a.days, 0);

  const remaining = entitlement - used + adjusted;

  return { type, periodLabel, periodStart, periodEnd, entitlement, used, adjusted, remaining };
}

function fmt(d: Date): string {
  return toUtcDateOnly(d).toISOString().slice(0, 10);
}
