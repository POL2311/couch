"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { type Student } from "@/lib/mock-data";
import { buildFeedItems } from "@/lib/activity";
import { FeedRow } from "@/components/feed-row";
import { RowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";

const PAGE_SIZE = 50;

export default function ActivityPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/students");
        if (res.ok) setStudents(await res.json());
      } catch (e) {
        console.error("Error fetching students:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Estado de página en la URL (sobrevive refresh).
  useEffect(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);
    if (p > 1) setPage(p);
  }, []);

  const items = useMemo(() => buildFeedItems(students), [students]);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (safePage > 1) params.set("page", String(safePage));
    else params.delete("page");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [safePage]);

  return (
    <>
      <header className="px-4 lg:px-8 py-5 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/coach" className="text-[13px] inline-flex items-center gap-1 hover:underline" style={{ color: "var(--text-tertiary)" }}>
          <ArrowLeft size={14} strokeWidth={1.75} />
          Volver al dashboard
        </Link>
        <h1 className="text-[16px] font-semibold tracking-tight mt-2" style={{ color: "var(--text-primary)" }}>
          Actividad reciente
        </h1>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Historial de pesajes y altas de tus alumnos.
        </p>
      </header>

      <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto pb-24 md:pb-8">
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
          {isLoading ? (
            <div className="p-5"><RowSkeleton count={8} /></div>
          ) : items.length === 0 ? (
            <EmptyState icon={Activity} message="Aún no hay actividad" className="py-12" />
          ) : (
            <>
              <div className="divide-y divide-[var(--border-subtle)]">
                {pageItems.map((item) => <FeedRow key={item.key} item={item} />)}
              </div>
              {items.length > PAGE_SIZE && (
                <div className="flex items-center justify-end gap-3 px-5 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    {start + 1}-{Math.min(start + PAGE_SIZE, items.length)} de {items.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(safePage - 1)}
                      disabled={safePage <= 1}
                      className="px-2.5 py-1 rounded-lg text-[12px] cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(safePage + 1)}
                      disabled={safePage >= totalPages}
                      className="px-2.5 py-1 rounded-lg text-[12px] cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
