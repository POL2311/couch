"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, AddButton } from "@/components/page-header";
import StatsRow from "@/components/stats-row";
import FilterBar, { type PaymentFilter } from "@/components/filter-bar";
import StudentTable from "@/components/student-table";
import BulkActionBar from "@/components/bulk-action-bar";
import AddStudentModal from "@/components/add-student-modal";
import ChangeStageModal from "@/components/change-stage-modal";
import { RowSkeleton } from "@/components/skeleton";
import { type Student, type Stage, type PaymentStatus } from "@/lib/mock-data";

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

  /* ── Filter State (estado en URL: ?estado&etapa&page) ── */
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");

  /* ── Selection State ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /* ── Filtered Students (filtros operan sobre el total) ── */
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (paymentFilter === "attention") {
        if (s.paymentStatus !== "grace_period" && s.paymentStatus !== "inactive") return false;
      } else if (paymentFilter !== "all" && s.paymentStatus !== paymentFilter) {
        return false;
      }
      if (stageFilter !== "all" && s.stage !== stageFilter) return false;
      return true;
    });
  }, [students, paymentFilter, stageFilter]);

  /* ── Paginación (50/pág) ── */
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageStudents = useMemo(
    () => filteredStudents.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredStudents, pageStart]
  );

  /* ── Filtros + página en la URL ── */
  const ESTADO_TO_SLUG: Record<string, string> = { active: "activo", grace_period: "gracia", inactive: "suspendido", attention: "atencion" };
  const SLUG_TO_ESTADO: Record<string, PaymentFilter> = { activo: "active", gracia: "grace_period", suspendido: "inactive", atencion: "attention" };
  const ETAPA_TO_SLUG: Record<string, string> = { Volumen: "volumen", Definición: "definicion", Mantenimiento: "mantenimiento", Recomposición: "recomposicion" };
  const SLUG_TO_ETAPA: Record<string, Stage> = { volumen: "Volumen", definicion: "Definición", mantenimiento: "Mantenimiento", recomposicion: "Recomposición" };

  // Leer al montar (sobrevive refresh / navegación).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const est = sp.get("estado");
    if (est && SLUG_TO_ESTADO[est]) setPaymentFilter(SLUG_TO_ESTADO[est]);
    const eta = sp.get("etapa");
    if (eta && SLUG_TO_ETAPA[eta]) setStageFilter(SLUG_TO_ETAPA[eta]);
    const p = parseInt(sp.get("page") || "1", 10);
    if (p > 1) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escribir cambios (omite la 1ª ejecución para no pisar la hidratación).
  const firstWrite = useRef(true);
  useEffect(() => {
    if (firstWrite.current) { firstWrite.current = false; return; }
    const sp = new URLSearchParams();
    if (paymentFilter !== "all") sp.set("estado", ESTADO_TO_SLUG[paymentFilter]);
    if (stageFilter !== "all") sp.set("etapa", ETAPA_TO_SLUG[stageFilter]);
    if (safePage > 1) sp.set("page", String(safePage));
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter, stageFilter, safePage]);

  /* ── Handlers de filtro (resetean a página 1) ── */
  const handlePaymentFilter = useCallback((f: PaymentFilter) => { setPaymentFilter(f); setPage(1); }, []);
  const handleStageFilter = useCallback((f: Stage | "all") => { setStageFilter(f); setPage(1); }, []);
  const handleClearFilters = useCallback(() => { setPaymentFilter("all"); setStageFilter("all"); setPage(1); }, []);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const alerts = students.filter(
      (s) => s.paymentStatus === "grace_period" || s.paymentStatus === "inactive"
    ).length;
    const scheduledChanges = students.filter((s: any) => s.scheduledChange != null).length;
    return { total, active, alerts, scheduledChanges };
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

  const handleStatusToggle = useCallback(async (id: string, currentStatus: PaymentStatus) => {
    const newStatus = ["active", "grace_period"].includes(currentStatus) ? "inactive" : "active";
    try {
      const res = await fetch("/api/coach/students/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id, status: newStatus }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => s.id === id ? { ...s, paymentStatus: newStatus as PaymentStatus } : s)
        );
      } else {
        console.error("[Coach] Error cambiando estado del alumno");
      }
    } catch (err) {
      console.error("[Coach] Error de red al cambiar estado:", err);
    }
  }, []);

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
      {/* ── Header canónico ── */}
      <PageHeader
        title="Alumnos"
        count={isLoading ? undefined : stats.total}
        hint="Gestión de tus alumnos: progreso, etapa y estado de pago."
        cta={<AddButton label="Agregar alumno" onClick={() => setIsAddModalOpen(true)} />}
      />

      {/* ── KPI Stats (Atención → filtra gracia+suspendido) ── */}
      <StatsRow
        totalStudents={stats.total}
        activeStudents={stats.active}
        alertStudents={stats.alerts}
        scheduledChanges={stats.scheduledChanges}
        onAlertClick={() => handlePaymentFilter("attention")}
      />

      {/* ── Table Area ── */}
      <div
        className="flex-1 mx-4 md:mx-8 mb-6 rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* ── Filter Bar ── */}
        <FilterBar
          activePaymentFilter={paymentFilter}
          activeStageFilter={stageFilter}
          onPaymentFilterChange={handlePaymentFilter}
          onStageFilterChange={handleStageFilter}
          totalStudents={students.length}
          filteredCount={filteredStudents.length}
          students={students}
          onClear={handleClearFilters}
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
            onStatusToggle={handleStatusToggle}
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
