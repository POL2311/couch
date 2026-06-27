import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getDailyChecks, setDailyCheck } from "@/lib/db";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function today() {
  return new Date().toISOString().split("T")[0];
}

/* GET /api/me/checks?date=YYYY-MM-DD → ítems marcados del alumno ese día. */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }
  const date = request.nextUrl.searchParams.get("date") || today();
  const checks = await getDailyChecks(user.studentId, date);
  return NextResponse.json({ date, checks }, { headers: NO_STORE });
}

/* POST /api/me/checks { date?, kind, itemKey, done } → marca/desmarca un ítem. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "CLIENT" || !user.studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: NO_STORE });
  }
  const { date, kind, itemKey, done } = await request.json();
  if (!kind || !itemKey) {
    return NextResponse.json({ error: "kind e itemKey son requeridos" }, { status: 400, headers: NO_STORE });
  }
  await setDailyCheck(user.studentId, date || today(), kind, itemKey, !!done);
  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
