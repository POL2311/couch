import { NextRequest, NextResponse } from "next/server";
import { getTemplates, addTemplate } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const type = request.nextUrl.searchParams.get("type") as "diet" | "routine" | null;
  const templates = await getTemplates(type ?? undefined);
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { type, name, ...data } = body;
  if (!type || !name) {
    return NextResponse.json({ error: "Tipo y nombre son requeridos" }, { status: 400 });
  }

  const coachId = user.role === "COACH" ? user.coachId ?? undefined : undefined;
  const created = await addTemplate(type, name, data, coachId);
  return NextResponse.json(created);
}
