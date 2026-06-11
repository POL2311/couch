import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/* ── POST: create a new empty measurement (add month) ── */
export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;

  const today = new Date().toISOString().split("T")[0];
  const created = await prisma.measurement.create({
    data: { studentId: id, date: today, chest: 0, waist: 0, hips: 0, armL: 0, armR: 0, thighL: 0, thighR: 0 },
  });
  return NextResponse.json(created, { status: 201 });
}

/* ── PATCH: update a specific measurement record by id ── */
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await params; // ensure route params are resolved

  const body = await request.json();
  const { id: measId, chest, waist, hips, armL, armR, thighL, thighR, date } = body;

  if (!measId) return NextResponse.json({ error: "id de medición requerido" }, { status: 400 });

  const updated = await prisma.measurement.update({
    where: { id: measId },
    data: {
      ...(chest    != null && { chest:  parseFloat(chest)  }),
      ...(waist    != null && { waist:  parseFloat(waist)  }),
      ...(hips     != null && { hips:   parseFloat(hips)   }),
      ...(armL     != null && { armL:   parseFloat(armL)   }),
      ...(armR     != null && { armR:   parseFloat(armR)   }),
      ...(thighL   != null && { thighL: parseFloat(thighL) }),
      ...(thighR   != null && { thighR: parseFloat(thighR) }),
      ...(date     != null && { date:   String(date)       }),
    },
  });
  return NextResponse.json(updated);
}
