import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { deleteNotice } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * DELETE /api/coach/notices/[id]
 * Deletes a GroupMessage. The notice must belong to the authenticated coach's room.
 * Students are never allowed to reach this endpoint (role guard + coachId ownership check).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || user.role !== "COACH" || !user.coachId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400, headers: NO_STORE });
  }

  const deleted = await deleteNotice(id, user.coachId);
  if (!deleted) {
    return NextResponse.json(
      { error: "Aviso no encontrado o no pertenece a esta sala" },
      { status: 404, headers: NO_STORE },
    );
  }

  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
