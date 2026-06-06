"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Plug, ChevronRight, X, CreditCard, Search, CheckCircle2 } from "lucide-react";
import { Skeleton, RowSkeleton } from "@/components/skeleton";
import { EmptyState } from "@/components/empty-state";
import { DetailOverlay } from "@/components/detail-overlay";
import { InfoHint } from "@/components/info-hint";
import { type Student, type PaymentStatus } from "@/lib/mock-data";
import { PAYMENT_STATUS_LABELS, statusTone, PAYMENT_SECTION_LABELS } from "@/lib/status-labels";
import { MRR_LABEL } from "@/lib/kpi-labels";

/* ── Secciones por estado (iOS grouped list) — etiquetas del diccionario ── */
const PAYMENT_SECTIONS: { key: "action" | "active" | "disabled"; title: string; statuses: PaymentStatus[] }[] = [
  { key: "action", title: PAYMENT_SECTION_LABELS.action, statuses: ["grace_period"] },
  { key: "active", title: PAYMENT_SECTION_LABELS.active, statuses: ["active"] },
  { key: "disabled", title: PAYMENT_SECTION_LABELS.disabled, statuses: ["inactive"] },
];

function KVRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]"
      style={{ borderBottom: last ? "none" : "1px solid var(--border-subtle)" }}
    >
      <span className="shrink-0" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span className="tabular-nums text-right truncate" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

/* Contenido compartido por el bottom sheet (móvil) y el dialog (escritorio) */
function PaymentDetailBody({
  student,
  status,
  dueDate,
  onClose,
  onRemind,
}: {
  student: Student;
  status: { label: string; color: string; bg: string };
  dueDate: string;
  onClose: () => void;
  onRemind: () => void;
}) {
  const needsAction = student.paymentStatus === "grace_period";
  return (
    <div className="relative">
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute -top-1 right-0 p-2 rounded-full transition-colors cursor-pointer hover:bg-[color:var(--bg-hover)]"
        style={{ color: "var(--text-tertiary)" }}
      >
        <X size={18} strokeWidth={1.75} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 pr-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium"
          style={{ background: "var(--bg-surface-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
        >
          {student.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{student.name}</p>
          <p className="text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>{student.email}</p>
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5 whitespace-nowrap" style={{ color: status.color, background: status.bg }}>
          <span className="w-1 h-1 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </div>

      {/* Pares clave-valor */}
      <div className="mt-5 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
        <KVRow label="Cuota" value="$1,200 MXN" />
        <KVRow label="Estado" value={status.label} />
        <KVRow label="Próximo vencimiento" value={new Date(dueDate + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })} />
        <KVRow label="Correo" value={student.email} last />
      </div>

      {/* Acciones apiladas */}
      <div className="mt-5 space-y-2.5">
        {needsAction && (
          <button
            onClick={onRemind}
            className="w-full py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85"
            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
          >
            Recordar pago
          </button>
        )}
        <button
          onClick={() => alert("Redirigiendo a Panel Stripe Express de MyCoach...")}
          className="w-full py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
          style={{ background: "var(--bg-surface-raised)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
        >
          Ver en Stripe
        </button>
      </div>
    </div>
  );
}

/* Facepile: hasta 5 avatares de 20px solapados + "+N" */
function Facepile({ items }: { items: Student[] }) {
  const shown = items.slice(0, 5);
  const extra = items.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((s, i) => (
        <div
          key={s.id}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium"
          style={{ marginLeft: i === 0 ? 0 : -8, background: "var(--bg-surface-overlay)", color: "var(--text-secondary)", border: "1px solid var(--bg-surface)" }}
        >
          {s.avatarInitials}
        </div>
      ))}
      {extra > 0 && <span className="text-[11px] ml-1.5 shrink-0" style={{ color: "var(--text-tertiary)" }}>+{extra}</span>}
    </div>
  );
}

const STRIPE_HINT = "Las mensualidades se cobran automáticamente los días de corte del cliente.";

/* Botón compacto (atajo, no acción primaria) */
function StripeButton() {
  return (
    <button
      onClick={() => alert("Redirigiendo a Panel Stripe Express de MyCoach...")}
      className="px-3 py-1.5 rounded-lg border text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:bg-[color:var(--bg-hover)]"
      style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
    >
      Ver Dashboard de Stripe
    </button>
  );
}

/* Pares clave-valor del plan + línea de tarjeta (compartido desktop/móvil) */
function SaaSDetails() {
  const rows: [string, string][] = [
    ["Plan actual", "Coach PRO"],
    ["Costo mensual", "$49.00 USD"],
    ["Próximo cargo", "24 de junio, 2026"],
  ];
  return (
    <>
      <div className="space-y-2.5 text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <span style={{ color: "var(--text-secondary)" }}>{k}</span>
            <span className="font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-success)" }} />
        <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Tarjeta de débito · termina en 4242</span>
      </div>
    </>
  );
}

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
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
    };
    fetchStudents();
  }, []);

  // Compute dynamic payment states
  const metrics = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.paymentStatus === "active").length;
    const grace = students.filter((s) => s.paymentStatus === "grace_period").length;
    const inactive = students.filter((s) => s.paymentStatus === "inactive").length;

    // Monthly Fee: $1,200 MXN per student
    const mrr = active * 1200 + grace * 600;
    const atRisk = grace * 1200;

    return { total, active, grace, inactive, mrr, atRisk };
  }, [students]);

  const [selected, setSelected] = useState<Student | null>(null);

  // ── Estado del acordeón + búsqueda (compartido por desktop y móvil) ──
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // sin persistencia: arranca colapsado
  const SECTION_CAP = 10;
  const [shown, setShown] = useState<Record<string, number>>({});

  const remind = useCallback((s: Student) => {
    alert(`Recordatorio de pago enviado a ${s.name}`);
  }, []);

  const q = search.trim().toLowerCase();
  const isSearching = q.length > 0;

  // Secciones por estado (filtradas por búsqueda). "Requieren acción" siempre primera.
  const sections = useMemo(() => {
    const match = (s: Student) =>
      !isSearching || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    return PAYMENT_SECTIONS.map((sec) => ({
      key: sec.key,
      title: sec.title,
      collapsible: sec.key !== "action",
      items: students.filter((s) => sec.statuses.includes(s.paymentStatus) && match(s)),
    }));
  }, [students, q, isSearching]);

  const toggleSection = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Expandida si: no colapsable (acción), o hay búsqueda activa, o el usuario la abrió.
  const isExpanded = (sec: { key: string; collapsible: boolean }) =>
    !sec.collapsible || isSearching || expanded.has(sec.key);

  // KPIs navegables: expande la sección y hace scroll hacia ella.
  const focusSection = (key: "action" | "active" | "disabled") => {
    if (key !== "action") setExpanded((prev) => new Set(prev).add(key));
    setTimeout(() => {
      document.getElementById(`pay-sec-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // Techo: acción siempre completa; en búsqueda mostramos todas las coincidencias;
  // si no, cap 10 con revelado incremental de 50.
  const sectionLimit = (sec: { key: string; collapsible: boolean; items: Student[] }) =>
    !sec.collapsible || isSearching ? sec.items.length : Math.min(sec.items.length, shown[sec.key] ?? SECTION_CAP);
  const revealMore = (key: string, total: number) =>
    setShown((p) => ({ ...p, [key]: Math.min(total, (p[key] ?? SECTION_CAP) + 50) }));

  const getStatusStyle = (status: PaymentStatus) => {
    const meta = PAYMENT_STATUS_LABELS[status];
    const tone = statusTone(status);
    return { label: meta.label, color: tone.color, bg: tone.bg };
  };

  const calculateDueDate = (joinedDateStr: string, status: string) => {
    // Generate a fixed day of the month based on the joinedDate
    const joinedDate = new Date(joinedDateStr + "T00:00:00");
    const day = joinedDate.getDate();
    
    // Return formatted next due date
    const today = new Date();
    let month = today.getMonth();
    
    if (status === "grace_period") {
      // Grace period due date is in the past/late
      const lateDate = new Date(today.getFullYear(), month, day - 3);
      return lateDate.toISOString().split("T")[0];
    } else if (status === "inactive") {
      // Inactive has missed payment
      const missedDate = new Date(today.getFullYear(), month - 1, day);
      return missedDate.toISOString().split("T")[0];
    } else {
      // Active has next payment in current or next month
      const dueDate = new Date(today.getFullYear(), month + (today.getDate() > day ? 1 : 0), day);
      return dueDate.toISOString().split("T")[0];
    }
  };

  return (
    <>
      {/* Header */}
      <header
        className="px-4 md:px-8 py-5 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Gestión de Suscripciones
          </h1>
          <InfoHint text="Controla las cuotas mensuales de tus clientes y el estado de la integración de Stripe." />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 md:px-8 py-6 space-y-6 overflow-y-auto pb-24 md:pb-8">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* MRR (no navegable) */}
          <div
            className="p-5 rounded-xl border animate-fade-in flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">{MRR_LABEL.short}</span>
              <span className="hidden md:inline">{MRR_LABEL.full}</span>
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-32 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums whitespace-nowrap" style={{ color: metrics.mrr === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                ${metrics.mrr.toLocaleString("es-MX")}
                <span className="text-[13px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>MXN</span>
              </p>
            )}
            <span className="text-[12px] mt-2 truncate" style={{ color: "var(--text-secondary)" }}>
              Cuota base $1,200/alumno
            </span>
          </div>

          {/* Al día → expande sección "active" */}
          <button
            type="button"
            onClick={() => focusSection("active")}
            aria-label="Ver suscripciones al día"
            className="p-5 rounded-xl border animate-fade-in flex flex-col text-left cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">Al día</span>
              <span className="hidden md:inline">Suscripciones al día</span>
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-16 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums whitespace-nowrap" style={{ color: metrics.active === 0 ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                {metrics.active}
                <span className="text-[13px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>de {metrics.total}</span>
              </p>
            )}
          </button>

          {/* En riesgo → scroll a "Requieren acción" */}
          <button
            type="button"
            onClick={() => focusSection("action")}
            aria-label="Ver alumnos que requieren acción"
            className="p-5 rounded-xl border animate-fade-in flex flex-col text-left cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">En riesgo</span>
              <span className="hidden md:inline">Ingresos en riesgo</span>
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-32 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums whitespace-nowrap" style={{ color: metrics.atRisk > 0 ? "var(--color-warning)" : "var(--text-tertiary)" }}>
                ${metrics.atRisk.toLocaleString("es-MX")}
                <span className="text-[13px] font-medium ml-1" style={{ color: "var(--text-secondary)" }}>MXN</span>
              </p>
            )}
            <span className="text-[12px] mt-2 truncate" style={{ color: "var(--text-secondary)" }}>
              {metrics.grace} pagos {PAYMENT_STATUS_LABELS.grace_period.short.toLowerCase()}s
            </span>
          </button>

          {/* Suspendidas → expande sección "disabled" */}
          <button
            type="button"
            onClick={() => focusSection("disabled")}
            aria-label="Ver cuentas suspendidas"
            className="p-5 rounded-xl border animate-fade-in flex flex-col text-left cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-[11px] uppercase font-medium truncate" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
              <span className="md:hidden">Suspendidas</span>
              <span className="hidden md:inline">Cuentas suspendidas</span>
            </span>
            {isLoading ? (
              <Skeleton className="h-[30px] w-16 mt-2" />
            ) : (
              <p className="text-[clamp(1.5rem,5vw,1.875rem)] font-semibold leading-none mt-2 tabular-nums whitespace-nowrap" style={{ color: metrics.inactive > 0 ? "var(--color-danger)" : "var(--text-tertiary)" }}>
                {metrics.inactive}
              </p>
            )}
          </button>

        </div>

        {/* Tables & Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Cobros y Alumnos — agrupado por estado (lista iOS en móvil, tabla en desktop) */}
          <div
            className="md:col-span-2 rounded-xl border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="px-4 md:px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--bg-surface-raised)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] shrink-0" style={{ color: "var(--text-secondary)" }}>
                Cobros y Alumnos
              </h3>
              <div className="relative min-w-0 w-full max-w-[220px]">
                <Search size={14} strokeWidth={1.75} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg text-[12px] outline-none"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-4"><RowSkeleton count={6} /></div>
            ) : students.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                message="Sin alumnos registrados"
                hint="Registra alumnos para gestionar sus cobros mensuales."
                className="py-12"
              />
            ) : (
              <div>
                {sections.map((sec) => {
                  // "Requieren acción" siempre visible (empty state positivo si no hay y no se busca).
                  // Colapsables solo si tienen items (en búsqueda, solo con coincidencias).
                  if (sec.key === "action") {
                    if (isSearching && sec.items.length === 0) return null;
                  } else if (sec.items.length === 0) {
                    return null;
                  }

                  const open = isExpanded(sec);
                  const limit = sectionLimit(sec);
                  const remaining = sec.items.length - limit;

                  return (
                    <div key={sec.key} id={`pay-sec-${sec.key}`} style={{ scrollMarginTop: "72px", borderTop: sec.key === "action" ? "none" : "1px solid var(--border-subtle)" }}>
                      {/* ── Header de sección ── */}
                      {sec.collapsible ? (
                        <button
                          onClick={() => toggleSection(sec.key)}
                          aria-expanded={open}
                          className="w-full flex items-center gap-3 px-4 md:px-5 cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
                          style={{ height: 48 }}
                        >
                          <ChevronRight
                            size={14}
                            strokeWidth={1.75}
                            className="shrink-0"
                            style={{ color: "var(--text-tertiary)", transform: open ? "rotate(90deg)" : "none", transition: "transform 200ms ease-out" }}
                          />
                          <span className="text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                            {sec.title} · {sec.items.length}
                          </span>
                          <div className="ml-auto"><Facepile items={sec.items} /></div>
                        </button>
                      ) : (
                        <div className="px-4 md:px-5 pt-4 pb-2 text-[11px] uppercase font-medium" style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}>
                          {sec.title} · {sec.items.length}
                        </div>
                      )}

                      {/* Empty state positivo de "Requieren acción" */}
                      {sec.key === "action" && sec.items.length === 0 && !isSearching && (
                        <div className="flex items-center gap-2 px-4 md:px-5 pb-4">
                          <CheckCircle2 size={16} strokeWidth={1.75} style={{ color: "var(--color-success)" }} />
                          <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Sin pagos pendientes</span>
                        </div>
                      )}

                      {/* ── Cuerpo (animado en colapsables) ── */}
                      <div
                        style={sec.collapsible ? { display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 200ms ease-out" } : undefined}
                      >
                        <div
                          className={sec.collapsible ? "overflow-hidden" : ""}
                          style={sec.collapsible ? { opacity: open ? 1 : 0, transition: "opacity 200ms ease-out" } : undefined}
                        >
                          {sec.items.slice(0, limit).map((student) => {
                            const status = getStatusStyle(student.paymentStatus);
                            const needsAction = student.paymentStatus === "grace_period";
                            return (
                              <div
                                key={student.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelected(student)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(student); } }}
                                className="w-full flex items-center gap-3 px-4 md:px-5 text-left cursor-pointer transition-colors hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)]"
                                style={{ minHeight: "var(--row-h-compact)", borderTop: "1px solid var(--border-subtle)" }}
                              >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium" style={{ background: "var(--bg-surface-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                                  {student.avatarInitials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[14px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{student.name}</p>
                                  <p className="text-[12px] truncate" style={{ color: "var(--text-tertiary)" }} title={student.email}>{student.email}</p>
                                </div>
                                <span className="hidden md:inline text-[12px] tabular-nums shrink-0" style={{ color: "var(--text-primary)" }}>$1,200</span>
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap inline-flex items-center gap-1.5 shrink-0" style={{ color: status.color, background: status.bg }}>
                                  <span className="w-1 h-1 rounded-full" style={{ background: status.color }} />
                                  {status.label}
                                </span>
                                {needsAction && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); remind(student); }}
                                    className="hidden md:inline-flex px-2.5 py-1 text-[10px] rounded-lg whitespace-nowrap transition-colors cursor-pointer hover:bg-[color:var(--bg-surface-raised)] shrink-0"
                                    style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                                  >
                                    Recordar
                                  </button>
                                )}
                                <ChevronRight size={14} strokeWidth={1.75} className="md:hidden shrink-0" style={{ color: "var(--text-tertiary)" }} />
                              </div>
                            );
                          })}
                          {remaining > 0 && (
                            <button
                              onClick={() => revealMore(sec.key, sec.items.length)}
                              className="w-full text-left px-4 md:px-5 py-3 text-[12px] cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
                              style={{ color: "var(--text-primary)", borderTop: "1px solid var(--border-subtle)" }}
                            >
                              {remaining <= 50 ? `Mostrar los ${remaining} restantes` : "Mostrar 50 más"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stripe & SaaS Billing Status (Col 3) */}
          <div className="flex flex-col gap-5">

            {/* ═══ DESKTOP: dos cards ═══ */}
            {/* Stripe */}
            <div className="hidden md:block rounded-xl border overflow-hidden p-5" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--text-secondary)" }}>
                  Pasarela de Pagos (Stripe)
                </h3>
                <InfoHint text={STRIPE_HINT} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Plug size={20} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-success)" }} />
                  <span className="text-[13px] truncate" style={{ color: "var(--text-primary)" }}>Conectado con éxito</span>
                </div>
                <div className="ml-auto"><StripeButton /></div>
              </div>
            </div>

            {/* SaaS */}
            <div className="hidden md:block rounded-xl border overflow-hidden p-5" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] border-b border-[var(--border-subtle)] pb-3" style={{ color: "var(--text-secondary)" }}>
                Tu cuenta SaaS (MyCoach)
              </h3>
              <div className="mt-4">
                <SaaSDetails />
              </div>
            </div>

            {/* ═══ MÓVIL: una card "Facturación" con dos grupos ═══ */}
            <div className="md:hidden rounded-xl border overflow-hidden" style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}>
              <h3 className="px-5 py-4 border-b border-[var(--border-subtle)] text-[12px] font-semibold uppercase tracking-[0.06em] bg-[var(--bg-surface-raised)]" style={{ color: "var(--text-secondary)" }}>
                Facturación
              </h3>
              {/* Grupo 1: estado Stripe */}
              <div className="px-5 py-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-success)" }} />
                <span className="text-[13px] truncate min-w-0" style={{ color: "var(--text-primary)" }}>Stripe conectado</span>
                <div className="ml-auto"><StripeButton /></div>
              </div>
              {/* Grupo 2: plan + tarjeta */}
              <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <SaaSDetails />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ═══ Detalle de cobro — DetailOverlay (sheet móvil / dialog desktop) ═══ */}
      {selected && (() => {
        const status = getStatusStyle(selected.paymentStatus);
        const dueDate = calculateDueDate(selected.joinedDate, selected.paymentStatus);
        const close = () => setSelected(null);
        return (
          <DetailOverlay onClose={close} ariaLabel={`Cobro de ${selected.name}`} desktop="dialog">
            <PaymentDetailBody
              student={selected}
              status={status}
              dueDate={dueDate}
              onClose={close}
              onRemind={() => { remind(selected); close(); }}
            />
          </DetailOverlay>
        );
      })()}
    </>
  );
}
