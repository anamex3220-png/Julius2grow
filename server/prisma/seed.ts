import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_PASSWORD = "Julius2026!";

async function upsertUser(data: {
  email: string;
  name: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  hireDate: string;
  residesOutsideMexico?: boolean;
  managerEmail?: string;
}) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const managerId = data.managerEmail
    ? (await prisma.user.findUnique({ where: { email: data.managerEmail } }))?.id
    : undefined;

  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      name: data.name,
      role: data.role,
      hireDate: new Date(data.hireDate),
      residesOutsideMexico: data.residesOutsideMexico ?? false,
      passwordHash,
      managerId: managerId ?? null,
    },
  });
}

async function main() {
  console.log("Sembrando datos de ejemplo para Julius Vacaciones...");

  await upsertUser({
    email: "admin@julius2grow.com",
    name: "María Torres (RH)",
    role: "ADMIN",
    hireDate: "2015-01-10",
  });

  await upsertUser({
    email: "carlos.vega@julius2grow.com",
    name: "Carlos Vega",
    role: "MANAGER",
    hireDate: "2018-03-01",
  });

  await upsertUser({
    email: "lucia.fernandez@julius2grow.com",
    name: "Lucía Fernández",
    role: "MANAGER",
    hireDate: "2019-08-15",
  });

  await upsertUser({
    email: "pedro.ramirez@julius2grow.com",
    name: "Pedro Ramírez",
    role: "EMPLOYEE",
    hireDate: "2023-02-01",
    managerEmail: "carlos.vega@julius2grow.com",
  });

  await upsertUser({
    email: "sofia.jimenez@julius2grow.com",
    name: "Sofía Jiménez",
    role: "EMPLOYEE",
    hireDate: "2025-11-01",
    managerEmail: "carlos.vega@julius2grow.com",
  });

  await upsertUser({
    email: "daniela.lopez@julius2grow.com",
    name: "Daniela López",
    role: "EMPLOYEE",
    hireDate: "2019-05-01",
    managerEmail: "lucia.fernandez@julius2grow.com",
  });

  await upsertUser({
    email: "jorge.salinas@julius2grow.com",
    name: "Jorge Salinas",
    role: "EMPLOYEE",
    hireDate: "2021-06-01",
    residesOutsideMexico: true,
    managerEmail: "lucia.fernandez@julius2grow.com",
  });

  const holidays2026: Array<{ date: string; name: string }> = [
    { date: "2026-01-01", name: "Año Nuevo" },
    { date: "2026-02-02", name: "Día de la Constitución" },
    { date: "2026-03-16", name: "Natalicio de Benito Juárez" },
    { date: "2026-05-01", name: "Día del Trabajo" },
    { date: "2026-09-16", name: "Día de la Independencia" },
    { date: "2026-11-16", name: "Día de la Revolución" },
    { date: "2026-12-25", name: "Navidad" },
  ];

  for (const h of holidays2026) {
    await prisma.holiday.upsert({
      where: { date: new Date(h.date) },
      update: { name: h.name },
      create: { date: new Date(h.date), name: h.name },
    });
  }

  console.log("Listo. Todas las personas de ejemplo tienen la contraseña:", SEED_PASSWORD);
  console.log("Cuenta de RH/Admin: admin@julius2grow.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
