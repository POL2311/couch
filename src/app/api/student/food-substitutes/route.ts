import { NextResponse } from "next/server";
import { getFoodSubstitutes } from "@/lib/db";

/**
 * GET /api/student/food-substitutes
 * Returns the full catalog grouped by category.
 * No auth required — this is a read-only reference catalog.
 * Self-seeds defaults on first call if the table is empty.
 */
export async function GET() {
  const substitutes = await getFoodSubstitutes();
  const grouped = substitutes.reduce<Record<string, typeof substitutes>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});
  return NextResponse.json({ substitutes, grouped });
}
