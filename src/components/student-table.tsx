"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, SearchX, Shield, ShieldOff, Utensils, User as UserIcon, Loader2 } from "lucide-react";
import { type Student, type PaymentStatus } from "@/lib/mock-data";
import { PAYMENT_STATUS_LABELS, statusTone } from "@/lib/status-labels";
import { EmptyState } from "@/components/empty-state";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function getStageStyle(stage: string) {
  const map: Record<string, { color: string; bg: string }> = {
    Volumen: { color: "var(--stage-volumen)", bg: "var(--stage-volumen-subtle)" },
    Definición: { color: "var(--stage-definicion)", bg: "var(--stage-definicion-subtle)" },
    Mantenimiento: { color: "var(--stage-mantenimiento)", bg: "var(--stage-mantenimiento-subtle)" },
    Recomposición: { color: "var(--stage-recomposicion)", bg: "var(--stage-recomposicion-subtle)" },
  };
  return map[stage] || { color: "var(--text-secondary)", bg: "var(--bg-hover)" };
}

function getPaymentLabel(status: PaymentStatus) {
  const meta = PAYMENT_STATUS_LABELS[status];
  return { label: meta.label, color: statusTone(status).color };
}

function formatWeight(current: number, previous: number) {
  const diff = current - previous;
  const sign = diff > 0 ? "+" : "";
  const color =
    Math.abs(diff) < 0.1
      ? "var(--text-tertiary)"
      : diff > 0
        ? "var(--color-info)"
        : "var(--color-success)";
  return { text: `${sign}${diff.toFixed(1)}`, color };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function IconMore() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Custom Checkbox
   ═══════════════════════════════════════════ */

function Checkbox({
  checked,
  indeterminate,
  onChange,
  id,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  id?: string;
}) {
  return (
    <label className="flex items-center justify-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = !!indeterminate;
        }}
        onChange={onChange}
        className="sr-only peer"
      />
      <span
        className="w-[15px] h-[15px] rounded-[4px] flex items-center justify-center peer-focus-visible:ring-1 peer-focus-visible:ring-[color:var(--ring-on-dark)]"
        style={{
          border: `1px solid ${checked || indeterminate ? "var(--text-primary)" : "var(--border-strong)"}`,
          background: checked || indeterminate ? "var(--text-primary)" : "transparent",
          transition: "all var(--transition-fast)",
        }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5" style={{ color: "var(--text-inverse)" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        )}
        {indeterminate && (
          <svg className="w-2.5 h-2.5" style={{ color: "var(--text-inverse)" }} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        )}
      </span>
    </label>
  );
}

/* ═══════════════════════════════════════════
   Mobile Student Card
   ═══════════════════════════════════════════ */

function StudentCard({
  student,
  isSelected,
  onToggle,
}: {
  student: Student;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const weight = formatWeight(student.currentWeight, student.previousWeight);
  const stage = getStageStyle(student.stage);
  const payment = getPaymentLabel(student.paymentStatus);

  return (
    <div
      className="flex items-center gap-3 px-4 animate-fade-in"
      style={{
        minHeight: 64,
        background: isSelected ? "var(--bg-active)" : "transparent",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "background var(--transition-fast)",
      }}
    >
      {/* Avatar — checkbox on tap */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium cursor-pointer"
        style={{
          background: isSelected ? "var(--text-primary)" : "var(--bg-surface-overlay)",
          color: isSelected ? "var(--text-inverse)" : "var(--text-secondary)",
          border: `1px solid ${isSelected ? "var(--text-primary)" : "var(--border-default)"}`,
          transition: "all var(--transition-fast)",
        }}
        onClick={(e) => { e.preventDefault(); onToggle(); }}
      >
        {isSelected ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          student.avatarInitials
        )}
      </div>

      {/* Content — links to detail (una línea por dato) */}
      <Link href={`/coach/students/${student.id}`} className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {student.name}
          </span>
          <span className="text-[11px] shrink-0" style={{ color: payment.color }}>
            {payment.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5 text-[12px] tabular-nums overflow-hidden">
          <span className="shrink-0" style={{ color: "var(--text-secondary)" }}>{student.currentWeight} kg</span>
          <span className="shrink-0" style={{ color: weight.color }}>{weight.text}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] shrink-0" style={{ color: stage.color, background: stage.bg }}>
            {student.stage}
          </span>
          <span className="shrink-0" style={{ color: "var(--text-tertiary)" }}>{student.completionRate}%</span>
          {student.streak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] shrink-0" style={{ color: "var(--color-warning)" }}>
              <Flame size={12} strokeWidth={1.75} />
              <span className="tabular-nums">{student.streak}</span>
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Desktop Table
   ═══════════════════════════════════════════ */

interface StudentTableProps {
  students: Student[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onStatusToggle: (id: string, currentStatus: PaymentStatus) => Promise<void>;
}

type OpenMenu = {
  student: Student;
  top: number;
  right: number;
};

export default function StudentTable({
  students,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onStatusToggle,
}: StudentTableProps) {
  const router = useRouter();
  const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));
  const someSelected = students.some((s) => selectedIds.has(s.id)) && !allSelected;

  const [openMenu, setOpenMenu] = useState<OpenMenu | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer mousedown fuera del dropdown
  useEffect(() => {
    if (!openMenu) return;
    function close(e: MouseEvent) {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpenMenu(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  function handleOpenMenu(e: React.MouseEvent, student: Student) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOpenMenu({
      student,
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }

  async function handleToggleStatus(student: Student) {
    setStatusLoading(true);
    setOpenMenu(null);
    await onStatusToggle(student.id, student.paymentStatus);
    setStatusLoading(false);
  }

  return (
    <>
      {/* ═══ DESKTOP TABLE ═══ */}
      <div className="hidden md:block overflow-x-auto">
        <table id="students-table" className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-12 pl-6 pr-2 py-4 text-left" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} id="select-all-students" />
              </th>
              {["Nombre", "Peso", "Etapa", "Estado", "Adherencia", ""].map((h, i, arr) => (
                <th
                  key={i}
                  className={`sticky top-0 z-10 px-4 py-4 text-left text-[11px] font-normal tracking-[0.06em] uppercase whitespace-nowrap ${i === arr.length - 1 ? "pr-6" : ""}`}
                  style={{ color: "var(--text-tertiary)", background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const isSelected = selectedIds.has(student.id);
              const weight = formatWeight(student.currentWeight, student.previousWeight);
              const stage = getStageStyle(student.stage);
              const payment = getPaymentLabel(student.paymentStatus);

              return (
                <tr
                  key={student.id}
                  id={`student-row-${student.id}`}
                  onClick={() => router.push(`/coach/students/${student.id}`)}
                  className="group animate-fade-in cursor-pointer"
                  style={{
                    animationDelay: `${idx * 25}ms`,
                    height: "var(--row-h-compact)",
                    background: isSelected ? "var(--bg-active)" : "transparent",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Checkbox — no dispara la navegación de la fila */}
                  <td className="w-12 pl-6 pr-2" onClick={(e) => e.stopPropagation()} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <Checkbox checked={isSelected} onChange={() => onToggleSelect(student.id)} />
                  </td>

                  {/* Nombre · email en una sola línea */}
                  <td className="px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium"
                        style={{
                          background: "var(--bg-surface-overlay)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-default)",
                        }}
                      >
                        {student.avatarInitials}
                      </div>
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-[15px] font-medium truncate group-hover:underline underline-offset-2 decoration-[color:var(--underline-on-dark)]" style={{ color: "var(--text-primary)", maxWidth: "200px" }}>
                          {student.name}
                        </span>
                        <span className="text-[12px] truncate" style={{ color: "var(--text-tertiary)" }} title={student.email}>
                          · {student.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Peso · delta · fecha en una línea */}
                  <td className="px-4 whitespace-nowrap" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span className="text-[13px] tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {student.currentWeight}
                    </span>
                    <span className="text-[11px] ml-0.5" style={{ color: "var(--text-tertiary)" }}>kg</span>
                    <span className="text-[11px] ml-2 tabular-nums" style={{ color: weight.color }}>
                      {weight.text}
                    </span>
                    <span className="text-[10px] ml-1.5" style={{ color: "var(--text-tertiary)" }}>
                      {formatDate(student.lastWeighIn)}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ color: stage.color, background: stage.bg }}
                    >
                      {student.stage}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${student.paymentStatus === "grace_period" ? "animate-subtle-pulse" : ""}`}
                        style={{ background: payment.color }}
                      />
                      <span className="text-[12px]" style={{ color: payment.color }}>
                        {payment.label}
                      </span>
                    </div>
                  </td>

                  {/* Adherence */}
                  <td className="px-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--bg-surface-overlay)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${student.completionRate}%`,
                            background:
                              student.completionRate >= 80
                                ? "var(--color-success)"
                                : student.completionRate >= 50
                                  ? "var(--color-warning)"
                                  : "var(--color-danger)",
                            opacity: 0.6,
                            transition: "width 0.6s ease-out",
                          }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums w-7" style={{ color: "var(--text-tertiary)" }}>
                        {student.completionRate}%
                      </span>
                      {student.streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px]" style={{ color: "var(--color-warning)" }}>
                          <Flame size={14} strokeWidth={1.75} />
                          <span className="tabular-nums">{student.streak}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="pl-4 pr-6" onClick={(e) => e.stopPropagation()} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <button
                      id={`actions-${student.id}`}
                      onMouseDown={(e) => handleOpenMenu(e, student)}
                      className="w-[34px] h-[34px] flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                      style={{
                        color: openMenu?.student.id === student.id ? "var(--text-secondary)" : "var(--text-tertiary)",
                        background: openMenu?.student.id === student.id ? "var(--bg-active)" : "transparent",
                        transition: "all var(--transition-fast)",
                      }}
                      aria-label={`Acciones para ${student.name}`}
                    >
                      {statusLoading && openMenu === null ? <Loader2 size={14} className="animate-spin" /> : <IconMore />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ MOBILE CARD LIST ═══ */}
      <div className="md:hidden">
        {students.map((student, idx) => (
          <div key={student.id} style={{ animationDelay: `${idx * 25}ms` }}>
            <StudentCard
              student={student}
              isSelected={selectedIds.has(student.id)}
              onToggle={() => onToggleSelect(student.id)}
            />
          </div>
        ))}
      </div>

      {/* ═══ EMPTY STATE ═══ */}
      {students.length === 0 && (
        <EmptyState
          icon={SearchX}
          message="Sin resultados"
          hint="Ajusta los filtros para ver más alumnos."
          className="py-16 animate-fade-in"
        />
      )}

      {/* ═══ ACTION DROPDOWN (fixed overlay, evita overflow-clip de la tabla) ═══ */}
      {openMenu && (
        <div
          ref={dropdownRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: openMenu.top,
            right: openMenu.right,
            zIndex: 9999,
            minWidth: 210,
            background: "rgba(16,16,18,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            overflow: "hidden",
            animation: "dropIn 0.14s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <style>{`
            @keyframes dropIn {
              from { opacity:0; transform:translateY(-6px) scale(0.97); }
              to   { opacity:1; transform:translateY(0)    scale(1); }
            }
          `}</style>

          {/* Ver ficha */}
          <button
            onClick={() => { router.push(`/coach/students/${openMenu.student.id}`); setOpenMenu(null); }}
            className="w-full flex items-center gap-3 px-4 cursor-pointer transition-colors"
            style={{ height: 46, color: "rgba(255,255,255,0.88)", fontSize: 13 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <UserIcon size={14} style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }} />
            Ver ficha completa
          </button>

          <div style={{ height: 1, background: "rgba(255,255,255,0.055)", margin: "0 12px" }} />

          {/* Toggle estado */}
          {(() => {
            const isActive = ["active", "grace_period"].includes(openMenu.student.paymentStatus);
            return (
              <button
                onClick={() => handleToggleStatus(openMenu.student)}
                className="w-full flex items-center gap-3 px-4 cursor-pointer transition-colors"
                style={{ height: 46, color: isActive ? "#f87171" : "#34d399", fontSize: 13 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isActive ? "rgba(248,113,113,0.06)" : "rgba(52,211,153,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {isActive
                  ? <ShieldOff size={14} style={{ flexShrink: 0 }} />
                  : <Shield size={14} style={{ flexShrink: 0 }} />}
                {isActive ? "Suspender cuenta" : "Reactivar cuenta"}
              </button>
            );
          })()}

          <div style={{ height: 1, background: "rgba(255,255,255,0.055)", margin: "0 12px" }} />

          {/* Editar plan nutricional */}
          <button
            onClick={() => { router.push(`/coach/students/${openMenu.student.id}`); setOpenMenu(null); }}
            className="w-full flex items-center gap-3 px-4 cursor-pointer transition-colors"
            style={{ height: 46, color: "rgba(255,255,255,0.5)", fontSize: 13 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Utensils size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            Editar plan nutricional
          </button>
        </div>
      )}
    </>
  );
}
