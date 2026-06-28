import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import {
  updateCoachMonthlyPrice,
  getCoachRoomProfile,
  updateCoachRoomSettings,
} from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * GET /api/coach/profile
 * Returns { monthlyPrice, isPublic, joinCode }
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }
  const profile = await getCoachRoomProfile(user.coachId);
  return NextResponse.json(
    {
      monthlyPrice: profile?.monthlyPrice ?? 1200,
      isPublic:     profile?.isPublic     ?? false,
      joinCode:     profile?.joinCode     ?? null,
    },
    { headers: NO_STORE },
  );
}

/**
 * PATCH /api/coach/profile
 * Accepts any combination of: { monthlyPrice?, isPublic?, joinCode? }
 *
 * joinCode must be unique — returns 409 on collision.
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const body = await request.json().catch(() => ({}));
  const priceUpdate: { monthlyPrice?: number } = {};
  const roomUpdate:  { isPublic?: boolean; joinCode?: string | null } = {};

  // ── monthlyPrice ─────────────────────────────────────────────────────────
  if ("monthlyPrice" in body) {
    const price = parseFloat(String(body.monthlyPrice));
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Precio inválido." }, { status: 400, headers: NO_STORE });
    }
    priceUpdate.monthlyPrice = price;
  }

  // ── isPublic ──────────────────────────────────────────────────────────────
  if ("isPublic" in body) {
    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json({ error: "isPublic debe ser booleano." }, { status: 400, headers: NO_STORE });
    }
    roomUpdate.isPublic = body.isPublic;
  }

  // ── joinCode ──────────────────────────────────────────────────────────────
  if ("joinCode" in body) {
    const raw = body.joinCode;
    if (raw === null || raw === "") {
      roomUpdate.joinCode = null;
    } else if (typeof raw === "string") {
      const clean = raw.trim().toUpperCase();
      if (clean.length < 4 || clean.length > 24) {
        return NextResponse.json(
          { error: "El código debe tener entre 4 y 24 caracteres." },
          { status: 400, headers: NO_STORE },
        );
      }
      roomUpdate.joinCode = clean;
    } else {
      return NextResponse.json({ error: "joinCode inválido." }, { status: 400, headers: NO_STORE });
    }
  }

  if (Object.keys(priceUpdate).length === 0 && Object.keys(roomUpdate).length === 0) {
    return NextResponse.json({ error: "No se enviaron campos para actualizar." }, { status: 400, headers: NO_STORE });
  }

  try {
    if (priceUpdate.monthlyPrice !== undefined) {
      await updateCoachMonthlyPrice(user.coachId, priceUpdate.monthlyPrice);
    }
    if (Object.keys(roomUpdate).length > 0) {
      await updateCoachRoomSettings(user.coachId, roomUpdate);
    }
  } catch (err: any) {
    if (err?.code === "P2002" && (err?.meta?.target as string[] | undefined)?.includes("joinCode")) {
      return NextResponse.json(
        { error: "Ese código ya está en uso. Elige otro." },
        { status: 409, headers: NO_STORE },
      );
    }
    console.error("[coach/profile] PATCH failed:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500, headers: NO_STORE });
  }

  const updated = await getCoachRoomProfile(user.coachId);
  return NextResponse.json(
    {
      success:      true,
      monthlyPrice: updated?.monthlyPrice ?? 1200,
      isPublic:     updated?.isPublic     ?? false,
      joinCode:     updated?.joinCode     ?? null,
    },
    { headers: NO_STORE },
  );
}
