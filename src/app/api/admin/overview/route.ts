import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const MONTHLY_FEE = 1200; // MXN por alumno

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const coaches = await prisma.coach.findMany({
    include: {
      user: true,
      students: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalStudents = await prisma.student.count();
  const totalCoaches = coaches.length;
  const totalClients = await prisma.user.count({ where: { role: "CLIENT" } });
  const activeStudents = await prisma.student.count({ where: { paymentStatus: "active" } });

  const data = coaches.map((c) => ({
    id: c.id,
    name: c.user.name,
    email: c.user.email,
    studentCount: c.students.length,
    activeCount: c.students.filter((s) => s.paymentStatus === "active").length,
    mrr: c.students.filter((s) => s.paymentStatus === "active").length * MONTHLY_FEE,
  }));

  return NextResponse.json({
    metrics: {
      totalCoaches,
      totalStudents,
      totalClients,
      activeStudents,
      mrr: activeStudents * MONTHLY_FEE,
    },
    coaches: data,
  });
}
