import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const coachId = searchParams.get("coachId");
  if (!coachId) return NextResponse.json({ error: "coachId requerido" }, { status: 400 });

  const messages = await prisma.groupMessage.findMany({
    where: { coachId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { coachId, content, senderName } = body as { coachId: string; content: string; senderName: string };

  if (!coachId || !content?.trim()) {
    return NextResponse.json({ error: "coachId y content son requeridos" }, { status: 400 });
  }

  const message = await prisma.groupMessage.create({
    data: {
      coachId,
      senderId: user.id,
      senderName: senderName || user.name || "Alumno",
      role: user.role,
      content: content.trim(),
    },
  });

  return NextResponse.json(message, { status: 201 });
}
