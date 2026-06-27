import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * PATCH /api/me/wallet
 * Body: { delta: number }  — additive credit; use negative value to debit.
 * Rejects debits that would push the balance below zero.
 * Returns: { walletBalance }
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const b     = await request.json();
  const delta = typeof b?.delta === "number" ? b.delta : parseFloat(b?.delta);

  if (typeof delta !== "number" || isNaN(delta) || delta === 0) {
    return NextResponse.json({ error: "delta (número distinto de 0) es requerido" }, { status: 400, headers: NO_STORE });
  }

  if (delta < 0) {
    const current = await prisma.student.findUnique({
      where:  { id: user.studentId },
      select: { walletBalance: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404, headers: NO_STORE });
    }
    if (current.walletBalance + delta < 0) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 422, headers: NO_STORE });
    }
  }

  const updated = await prisma.student.update({
    where:  { id: user.studentId },
    data:   { walletBalance: { increment: delta } },
    select: { walletBalance: true },
  });

  return NextResponse.json(updated, { headers: NO_STORE });
}
