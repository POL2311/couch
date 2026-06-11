import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getCoachMonthlyPriceForStudent } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !user.studentId) {
    return NextResponse.json({ monthlyPrice: null });
  }
  const monthlyPrice = await getCoachMonthlyPriceForStudent(user.studentId);
  return NextResponse.json({ monthlyPrice });
}
