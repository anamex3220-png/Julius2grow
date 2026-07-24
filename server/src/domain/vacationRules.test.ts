import { describe, expect, it } from "vitest";
import {
  computeBalance,
  countBusinessDays,
  currentPersonalDaysSemester,
  currentServicePeriod,
  vacationEntitlementForeign,
  vacationEntitlementMx,
} from "./vacationRules.js";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe("vacationEntitlementMx (Ley Federal del Trabajo, reforma 2023)", () => {
  it("año 1 = 12 días", () => expect(vacationEntitlementMx(0)).toBe(12));
  it("año 2 = 14 días", () => expect(vacationEntitlementMx(1)).toBe(14));
  it("año 3 = 16 días", () => expect(vacationEntitlementMx(2)).toBe(16));
  it("año 4 = 18 días", () => expect(vacationEntitlementMx(3)).toBe(18));
  it("año 5 = 20 días", () => expect(vacationEntitlementMx(4)).toBe(20));
  it("año 6 (transición al bloque de 5 años) = 22 días", () => expect(vacationEntitlementMx(5)).toBe(22));
  it("año 10 = 22 días", () => expect(vacationEntitlementMx(9)).toBe(22));
  it("año 11 = 24 días", () => expect(vacationEntitlementMx(10)).toBe(24));
  it("año 16 = 26 días", () => expect(vacationEntitlementMx(15)).toBe(26));
  it("año 21 = 28 días", () => expect(vacationEntitlementMx(20)).toBe(28));
});

describe("vacationEntitlementForeign", () => {
  it("siempre 15 días hábiles fijos", () => {
    expect(vacationEntitlementForeign()).toBe(15);
  });
});

describe("currentServicePeriod", () => {
  it("identifica el primer año de servicio correctamente", () => {
    const period = currentServicePeriod(d("2025-03-10"), d("2025-06-01"));
    expect(period.completedYears).toBe(0);
    expect(period.start.toISOString().slice(0, 10)).toBe("2025-03-10");
    expect(period.end.toISOString().slice(0, 10)).toBe("2026-03-09");
  });

  it("detecta la transición justo en el aniversario", () => {
    const period = currentServicePeriod(d("2020-01-15"), d("2025-01-15"));
    expect(period.completedYears).toBe(5);
    expect(period.start.toISOString().slice(0, 10)).toBe("2025-01-15");
  });

  it("un día antes del aniversario sigue en el periodo anterior", () => {
    const period = currentServicePeriod(d("2020-01-15"), d("2025-01-14"));
    expect(period.completedYears).toBe(4);
  });
});

describe("currentPersonalDaysSemester (no acumulables entre semestres)", () => {
  it("enero-junio", () => {
    const s = currentPersonalDaysSemester(d("2026-04-15"));
    expect(s.start.toISOString().slice(0, 10)).toBe("2026-01-01");
    expect(s.end.toISOString().slice(0, 10)).toBe("2026-06-30");
  });

  it("julio-diciembre", () => {
    const s = currentPersonalDaysSemester(d("2026-11-01"));
    expect(s.start.toISOString().slice(0, 10)).toBe("2026-07-01");
    expect(s.end.toISOString().slice(0, 10)).toBe("2026-12-31");
  });
});

describe("countBusinessDays", () => {
  it("excluye fines de semana", () => {
    // Lunes 2026-01-05 a viernes 2026-01-09 = 5 días hábiles
    expect(countBusinessDays(d("2026-01-05"), d("2026-01-09"))).toBe(5);
  });

  it("excluye fines de semana dentro del rango", () => {
    // Lunes 2026-01-05 a lunes 2026-01-12 = 6 días hábiles (excluye sáb/dom)
    expect(countBusinessDays(d("2026-01-05"), d("2026-01-12"))).toBe(6);
  });

  it("excluye feriados", () => {
    const result = countBusinessDays(d("2026-01-01"), d("2026-01-02"), [{ date: d("2026-01-01") }]);
    expect(result).toBe(1);
  });
});

describe("computeBalance", () => {
  const user = { hireDate: d("2023-06-01"), residesOutsideMexico: false };

  it("calcula el balance de vacaciones descontando solicitudes aprobadas del periodo vigente", () => {
    const result = computeBalance(
      user,
      "VACACIONES",
      [{ type: "VACACIONES", startDate: d("2026-06-10"), businessDays: 5 }],
      [],
      d("2026-07-01")
    );
    // Año de servicio 4 (completedYears=3) => 18 días de ley
    expect(result.entitlement).toBe(18);
    expect(result.used).toBe(5);
    expect(result.remaining).toBe(13);
  });

  it("no acumula: una solicitud del periodo anterior no afecta el balance del periodo actual", () => {
    const result = computeBalance(
      user,
      "VACACIONES",
      [{ type: "VACACIONES", startDate: d("2025-06-15"), businessDays: 5 }],
      [],
      d("2026-07-01")
    );
    expect(result.used).toBe(0);
    expect(result.remaining).toBe(result.entitlement);
  });

  it("residente fuera de México siempre tiene 15 días hábiles, sin importar antigüedad", () => {
    const foreignUser = { hireDate: d("2010-01-01"), residesOutsideMexico: true };
    const result = computeBalance(foreignUser, "VACACIONES", [], [], d("2026-07-01"));
    expect(result.entitlement).toBe(15);
  });

  it("días personales: respeta el corte de semestre (no acumulable)", () => {
    const result = computeBalance(
      user,
      "DIAS_PERSONALES",
      [
        { type: "DIAS_PERSONALES", startDate: d("2026-02-10"), businessDays: 2 },
        { type: "DIAS_PERSONALES", startDate: d("2025-12-20"), businessDays: 3 },
      ],
      [],
      d("2026-04-01")
    );
    expect(result.entitlement).toBe(3);
    expect(result.used).toBe(2); // solo cuenta la del semestre Ene-Jun 2026
    expect(result.remaining).toBe(1);
  });

  it("aplica ajustes manuales de RH dentro del periodo", () => {
    const result = computeBalance(
      user,
      "VACACIONES",
      [],
      [{ type: "VACACIONES", days: 2, createdAt: d("2026-07-05") }],
      d("2026-07-10")
    );
    expect(result.remaining).toBe(result.entitlement + 2);
  });
});
