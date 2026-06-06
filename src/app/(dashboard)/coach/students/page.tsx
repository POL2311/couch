"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import StatsRow from "@/components/stats-row";
import FilterBar from "@/components/filter-bar";
import StudentTable from "@/components/student-table";
import BulkActionBar from "@/components/bulk-action-bar";
import AddStudentModal from "@/components/add-student-modal";
import ChangeStageModal from "@/components/change-stage-modal";
import { RowSkeleton } from "@/components/skeleton";
import { type Student, type PaymentStatus, type Stage } from "@/lib/mock-data";

/* ═══════════════════════════════════════════
   Coach Students Dashboard Page
   ═══════════════════════════════════════════ */

export default function StudentsPage() {
  const router = useRouter();

  /* ── Students State ── */
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with API on mount safely
  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /* ── Add Student Modal State ── */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  /* ── Filter State ── */
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  /* ── Selection State ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ── Filtered Students ── */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (paymentFilter !== "all" && s.paymentStatus !== paymentFilter) return false;
      if (stageFilter !== "all" && s.stage !== stageFilter) return false;
      return true;
    });
  }, [students, paymentFilter, stageFilter]);

  /* ── Paginación (50 por página, estado en ?page; filtros operan sobre el total) ── */
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

  // Leer ?page al montar (sobrevive refresh).
  useEffect(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);
    if (p > 1) setPage(p);
  }, []);

  // Volver a la primera página al cambiar filtros.
  useEffect(() => {
    setPage(1);
  }, [paymentFilter, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageStudents = useMemo(
    () => filteredStudents.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredStudents, pageStart]
  );

  // Reflejar la página en la URL sin recargar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (safePage > 1) params.set("page", String(safePage));
    else params.delete("page");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [safePage]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const alerts = students.filter(
      (s) => s.paymentStatus === "grace_period" || s.paymentStatus === "inactive"
    ).length;
    return { total, active, alerts, scheduledChanges: 3 };
  }, [students]);

  /* ── Selection Handlers ── */
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      // "Seleccionar todo" opera sobre la página visible.
      const ids = pageStudents.map((s) => s.id);
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(ids);
    });
  }, [pageStudents]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const [isChangeStageModalOpen, setIsChangeStageModalOpen] = useState(false);

  const handleScheduleStageChange = useCallback(() => {
    if (selectedIds.size === 0) return;
    setIsChangeStageModalOpen(true);
  }, [selectedIds.size]);

  const handleAddStudent = useCallback(async (newStudentData: {
    name: string;
    email: string;
    stage: Stage;
    stageNumber: number;
    startingWeight: number;
    height: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    photo?: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append("name", newStudentData.name);
      formData.append("email", newStudentData.email);
      formData.append("stage", newStudentData.stage);
      formData.append("stageNumber", String(newStudentData.stageNumber));
      formData.append("startingWeight", String(newStudentData.startingWeight));
      formData.append("height", String(newStudentData.height));
      
      if (newStudentData.bodyFat !== undefined) {
        formData.append("bodyFat", String(newStudentData.bodyFat));
      }
      if (newStudentData.chest !== undefined) {
        formData.append("chest", String(newStudentData.chest));
      }
      if (newStudentData.waist !== undefined) {
        formData.append("waist", String(newStudentData.waist));
      }
      if (newStudentData.hips !== undefined) {
        formData.append("hips", String(newStudentData.hips));
      }
      if (newStudentData.photo) {
        formData.append("photo", newStudentData.photo);
      }

      const response = await fetch("/api/students", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al agregar alumno");
      }

      const createdStudent = await response.json();
      
      // Update local state
      setStudents((prev) => [createdStudent, ...prev]);
      
      // Redirect to detail page
      router.push(`/coach/students/${createdStudent.id}`);
    } catch (error) {
      console.error(error);
      alert("Hubo un error al registrar al alumno.");
    }
  }, [router]);

  return (
    <>
      {/* ── Header ── */}
      <Header
        title="Alumnos"
        subtitle={isLoading ? "Cargando alumnos..." : `${stats.total} alumnos registrados`}
        onNewStudent={() => setIsAddModalOpen(true)}
      />

      {/* ── KPI Stats ── */}
      <StatsRow
        totalStudents={stats.total}
        activeStudents={stats.active}
        alertStudents={stats.alerts}
        scheduledChanges={stats.scheduledChanges}
      />

      {/* ── Table Area ── */}
      <div
        className="flex-1 mx-4 lg:mx-8 mb-6 rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* ── Filter Bar ── */}
        <FilterBar
          activePaymentFilter={paymentFilter}
          activeStageFilter={stageFilter}
          onPaymentFilterChange={setPaymentFilter}
          onStageFilterChange={setStageFilter}
          totalStudents={students.length}
          filteredCount={filteredStudents.length}
          students={students}
        />

        {/* ── Student Table ── */}
        {isLoading ? (
          <div className="p-5">
            <RowSkeleton count={6} />
          </div>
        ) : (
          <StudentTable
            students={pageStudents}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
          />
        )}

        {/* ── Paginación (50/pág) ── */}
        {!isLoading && filteredStudents.length > 0 && (
          <div className="flex items-center justify-end gap-3 px-5 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <span className="text-[11px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredStudents.length)} de {filteredStudents.length}
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
      </div>

      {/* ── Bulk Action Bar (floating) ── */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onClear={handleClearSelection}
        onScheduleStageChange={handleScheduleStageChange}
      />

      {/* ── Add Student Modal ── */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStudent}
      />

      {/* ── Change Stage Modal ── */}
      <ChangeStageModal
        isOpen={isChangeStageModalOpen}
        onClose={() => setIsChangeStageModalOpen(false)}
        studentIds={Array.from(selectedIds)}
        onSuccess={() => {
          handleClearSelection();
          fetchStudents();
        }}
      />
    </>
  );
}
