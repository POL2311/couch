"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/skeleton";

interface StudentRow {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  currentWeight: number;
  stage: string;
  completionRate: number;
  paymentStatus: string;
}
interface Data {
  coach: { id: string; name: string; email: string };
  students: StudentRow[];
}

export default function AdminCoachPage({ params }: { params: Promise<{ coachId: string }> }) {
  const { coachId } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/coaches/${coachId}/students`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-[13px] mb-6" style={{ color: "var(--text-tertiary)" }}>
        <ChevronLeft size={16} /> Volver a coaches
      </Link>

      <div className="mb-8">
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>Coach</p>
        <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {loading ? "…" : data?.coach.name}
        </h1>
        {!loading && <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{data?.coach.email}</p>}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
            Alumnos {!loading && `(${data?.students.length ?? 0})`}
          </h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : (
          <div>
            {data!.students.map((s) => (
              <Link
                key={s.id}
                href={`/coach/students/${s.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[color:var(--bg-hover)]"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white" style={{ background: s.avatarColor }}>
                    {s.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                    <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{s.stage} · {s.currentWeight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[13px] font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>{s.completionRate}%</span>
                  <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
                </div>
              </Link>
            ))}
            {data!.students.length === 0 && (
              <p className="text-[12px] py-8 text-center" style={{ color: "var(--text-tertiary)" }}>Este coach aún no tiene alumnos.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
