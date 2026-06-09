import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCarrerasFor, addCarrera } from "@/lib/db";

/* GET /api/carreras → carreras visibles según el rol del usuario. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const carreras = await getCarrerasFor(user);
  return NextResponse.json(carreras);
}

/* POST /api/carreras → registra una carrera del usuario autenticado. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await request.json();
    const { date, distanceM, durationS, avgSpeedKmh, track } = body ?? {};
    if (typeof distanceM !== "number" || typeof durationS !== "number") {
      return NextResponse.json({ error: "Datos de carrera inválidos" }, { status: 400 });
    }
    const carrera = await addCarrera(user.id, {
      date: date ?? new Date().toISOString().split("T")[0],
      distanceM,
      durationS,
      avgSpeedKmh: avgSpeedKmh ?? 0,
      track: Array.isArray(track) ? track : [],
    });
    return NextResponse.json(carrera, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Error" }, { status: 500 });
  }
}
