/**
 * Seed / migración: importa database.json al esquema relacional,
 * crea las cuentas de los 3 roles y siembra las plantillas base.
 *
 * Ejecutar:  node prisma/seed.ts   (Node 22+ con type stripping)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DIET_TEMPLATES, ROUTINE_TEMPLATES } from "../src/lib/templates.ts";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🌱 Sembrando base de datos…");

  // Limpieza (orden por dependencias)
  await prisma.scheduledChange.deleteMany();
  await prisma.weightEntry.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.template.deleteMany();
  await prisma.student.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.user.deleteMany();

  // ── Cuentas (3 roles) ──
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const admin = await prisma.user.create({
    data: { email: "admin@mycoach.app", name: "Administrador", role: "ADMIN", passwordHash: hash("admin123") },
  });

  const coachUser = await prisma.user.create({
    data: { email: "coach@mycoach.app", name: "Coach Demo", role: "COACH", passwordHash: hash("coach123") },
  });
  const coach = await prisma.coach.create({ data: { userId: coachUser.id } });

  console.log(`   ✓ Admin: ${admin.email} / admin123`);
  console.log(`   ✓ Coach: ${coachUser.email} / coach123`);

  // ── Plantillas base ──
  for (const t of DIET_TEMPLATES) {
    const { id, ...rest } = t;
    await prisma.template.create({
      data: { id, type: "diet", name: t.name, dataJson: JSON.stringify(rest), coachId: coach.id },
    });
  }
  for (const t of ROUTINE_TEMPLATES) {
    const { id, ...rest } = t;
    await prisma.template.create({
      data: { id, type: "routine", name: t.name, dataJson: JSON.stringify(rest), coachId: coach.id },
    });
  }
  console.log(`   ✓ Plantillas: ${DIET_TEMPLATES.length} dietas, ${ROUTINE_TEMPLATES.length} rutinas`);

  // ── Migración de database.json ──
  const dbPath = path.join(__dirname, "..", "src", "lib", "database.json");
  const raw = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const students: any[] = raw.students || [];
  const details: Record<string, any> = raw.studentDetails || {};

  let firstStudentId: string | null = null;

  for (const s of students) {
    const d = details[s.id] || {};
    const created = await prisma.student.create({
      data: {
        id: s.id, // preserva ids originales (s1, s2, …)
        name: s.name,
        email: s.email,
        avatarInitials: s.avatarInitials,
        avatarColor: s.avatarColor,
        currentWeight: s.currentWeight,
        previousWeight: s.previousWeight,
        lastWeighIn: s.lastWeighIn,
        stage: s.stage,
        stageNumber: s.stageNumber,
        paymentStatus: s.paymentStatus,
        joinedDate: s.joinedDate,
        streak: s.streak ?? 0,
        completionRate: s.completionRate ?? 0,
        height: d.height ?? null,
        bodyFat: d.bodyFat ?? null,
        photoName: d.photoName ?? null,
        notes: d.notes ?? "",
        nextStageDate: d.nextStageDate ?? null,
        dietJson: d.diet ? JSON.stringify(d.diet) : "",
        routineJson: d.routine ? JSON.stringify(d.routine) : "",
        coachId: coach.id,
        weightHistory: {
          create: (d.weightHistory || []).map((w: any) => ({ date: w.date, weight: w.weight })),
        },
        measurements: {
          create: (d.measurements || []).map((m: any) => ({
            date: m.date,
            chest: m.chest ?? 0,
            waist: m.waist ?? 0,
            hips: m.hips ?? 0,
            armL: m.armL ?? 0,
            armR: m.armR ?? 0,
            thighL: m.thighL ?? 0,
            thighR: m.thighR ?? 0,
          })),
        },
        photos: d.photoName ? { create: [{ url: d.photoName, label: "Foto inicial" }] } : undefined,
      },
    });

    if (d.scheduledChange) {
      await prisma.scheduledChange.create({
        data: {
          studentId: created.id,
          executionDate: d.scheduledChange.executionDate,
          stage: d.scheduledChange.stage,
          stageNumber: d.scheduledChange.stageNumber,
          dietTemplateId: d.scheduledChange.dietTemplateId ?? null,
          routineTemplateId: d.scheduledChange.routineTemplateId ?? null,
        },
      });
    }

    if (!firstStudentId) firstStudentId = created.id;
  }
  console.log(`   ✓ Alumnos migrados: ${students.length}`);

  // ── Cuenta de cliente vinculada al primer alumno ──
  if (firstStudentId) {
    const clientUser = await prisma.user.create({
      data: {
        email: "cliente@mycoach.app",
        name: "Alumno Demo",
        role: "CLIENT",
        passwordHash: hash("cliente123"),
      },
    });
    await prisma.student.update({ where: { id: firstStudentId }, data: { userId: clientUser.id } });
    console.log(`   ✓ Cliente: ${clientUser.email} / cliente123 (alumno ${firstStudentId})`);
  }

  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
