"use client";

/* ═══════════════════════════════════════════
   Panel de Control — Sala del Coach
   Telemetría en tiempo real + gestión de avisos + roster + token
   ═══════════════════════════════════════════ */
import { useEffect, useRef, useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { type Student } from "@/lib/mock-data";

/* ── Types ──────────────────────────────────── */

interface Telemetry {
  totalStudents: number;
  activeToday:   number;
  streakPct:     number;
  date:          string;
}

interface Notice {
  id:         string;
  senderName: string;
  role:       string;
  content:    string;
  createdAt:  string;
}

interface RoomProfile {
  isPublic:  boolean;
  joinCode:  string | null;
}

/* ── Helpers ─────────────────────────────────── */

const fmtDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

/* ═══════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════ */

export default function CoachSala() {
  const [telemetry, setTelemetry]       = useState<Telemetry | null>(null);
  const [telemetryLoading, setTelLoading] = useState(true);

  const [notices, setNotices]           = useState<Notice[]>([]);
  const [noticesLoading, setNLoading]   = useState(true);
  const [deletingNotice, setDN]         = useState<string | null>(null);

  const [students, setStudents]         = useState<Student[]>([]);
  const [studentsLoading, setSLoading]  = useState(true);
  const [unlinkConfirm, setUnlinkConfirm] = useState<string | null>(null);
  const [unlinking, setUnlinking]       = useState<string | null>(null);

  const [profile, setProfile]           = useState<RoomProfile | null>(null);
  const [profileLoading, setPLoading]   = useState(true);
  const [codeInput, setCodeInput]       = useState("");
  const [isPublicInput, setIsPublic]    = useState(false);
  const [savingCode, setSavingCode]     = useState(false);
  const [codeErr, setCodeErr]           = useState<string | null>(null);
  const [codeSaved, setCodeSaved]       = useState(false);

  const unlinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Data fetches ─────────────────────────── */

  useEffect(() => {
    fetch("/api/coach/telemetry")
      .then(r => r.ok ? r.json() : null)
      .then((d: Telemetry | null) => { if (d) setTelemetry(d); })
      .catch(() => {})
      .finally(() => setTelLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/coach/notices")
      .then(r => r.ok ? r.json() : null)
      .then((d: { notices: Notice[] } | null) => {
        if (d?.notices) setNotices(d.notices);
      })
      .catch(() => {})
      .finally(() => setNLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/students")
      .then(r => r.ok ? r.json() : [])
      .then((d: Student[]) => setStudents(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setSLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/coach/profile")
      .then(r => r.ok ? r.json() : null)
      .then((d: RoomProfile | null) => {
        if (!d) return;
        setProfile(d);
        setCodeInput(d.joinCode ?? "");
        setIsPublic(d.isPublic ?? false);
      })
      .catch(() => {})
      .finally(() => setPLoading(false));
  }, []);

  /* ── Actions ─────────────────────────────── */

  const deleteNotice = useCallback(async (id: string) => {
    setDN(id);
    try {
      const r = await fetch(`/api/coach/notices/${id}`, { method: "DELETE" });
      if (r.ok) setNotices(prev => prev.filter(n => n.id !== id));
    } finally {
      setDN(null);
    }
  }, []);

  const triggerUnlink = useCallback((studentId: string) => {
    if (unlinkConfirm === studentId) {
      setUnlinking(studentId);
      setUnlinkConfirm(null);
      if (unlinkTimerRef.current) clearTimeout(unlinkTimerRef.current);
      fetch(`/api/coach/students/${studentId}`, { method: "DELETE" })
        .then(r => { if (r.ok) setStudents(prev => prev.filter(s => s.id !== studentId)); })
        .catch(() => {})
        .finally(() => setUnlinking(null));
    } else {
      if (unlinkTimerRef.current) clearTimeout(unlinkTimerRef.current);
      setUnlinkConfirm(studentId);
      unlinkTimerRef.current = setTimeout(() => setUnlinkConfirm(null), 4000);
    }
  }, [unlinkConfirm]);

  const saveCode = useCallback(async () => {
    setSavingCode(true);
    setCodeErr(null);
    setCodeSaved(false);
    const body: Record<string, unknown> = { isPublic: isPublicInput };
    const trimmed = codeInput.trim().toUpperCase();
    if (trimmed !== (profile?.joinCode ?? "")) body.joinCode = trimmed || null;
    try {
      const r = await fetch("/api/coach/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setCodeErr(d.error ?? "Error al guardar."); return; }
      setProfile({ isPublic: d.isPublic, joinCode: d.joinCode });
      setCodeInput(d.joinCode ?? "");
      setIsPublic(d.isPublic);
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 2500);
    } catch {
      setCodeErr("Error de red.");
    } finally {
      setSavingCode(false);
    }
  }, [codeInput, isPublicInput, profile]);

  /* ── Render ──────────────────────────────── */

  return (
    <>
      <PageHeader title="Sala" hint="Panel de control: telemetría, avisos, roster y token de acceso." />
      <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto pb-24 md:pb-8 space-y-4">

        {/* ── Telemetría ─────────────────────────── */}
        <Section title="TELEMETRÍA EN TIEMPO REAL">
          {telemetryLoading ? (
            <div className="flex gap-4">
              <SkeletonBox w="120px" h="80px" />
              <SkeletonBox w="140px" h="80px" />
              <SkeletonBox w="140px" h="80px" />
            </div>
          ) : telemetry ? (
            <div className="flex flex-wrap gap-4">
              <TelemetryKpi
                label="ADHERENCIA HOY"
                value={`${telemetry.streakPct}%`}
                accent={
                  telemetry.streakPct >= 80 ? "#34d399"
                  : telemetry.streakPct >= 50 ? "#fbbf24"
                  : "#f87171"
                }
              />
              <TelemetryKpi label="ACTIVOS HOY" value={String(telemetry.activeToday)} />
              <TelemetryKpi label="TOTAL ALUMNOS" value={String(telemetry.totalStudents)} />
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>Sin datos</p>
          )}
        </Section>

        {/* ── Token de Acceso ─────────────────────── */}
        <Section title="TOKEN DE ACCESO">
          {profileLoading ? (
            <div className="space-y-3">
              <SkeletonBox w="100%" h="44px" />
              <SkeletonBox w="180px" h="36px" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* isPublic toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
                <div
                  onClick={() => setIsPublic(v => !v)}
                  className="relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer"
                  style={{
                    background: isPublicInput ? "#34d399" : "var(--border-subtle)",
                  }}
                  role="switch"
                  aria-checked={isPublicInput}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200"
                    style={{
                      background: "white",
                      transform: isPublicInput ? "translateX(16px)" : "translateX(0)",
                    }}
                  />
                </div>
                <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  Sala pública (visible en directorio)
                </span>
              </label>

              {/* joinCode input */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="text"
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value.toUpperCase())}
                  maxLength={24}
                  placeholder="CÓDIGO TÁCTICO (4–24 chars)"
                  className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-mono outline-none focus:ring-1 focus:ring-[color:var(--ring-on-dark)] w-full sm:w-auto"
                  style={{
                    background: "var(--bg-surface-overlay)",
                    border:     "1px solid var(--border-subtle)",
                    color:      "var(--text-primary)",
                  }}
                />
                <button
                  onClick={saveCode}
                  disabled={savingCode}
                  className="px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-opacity disabled:opacity-50"
                  style={{ background: "var(--text-primary)", color: "var(--bg-app)" }}
                >
                  {savingCode ? "GUARDANDO…" : codeSaved ? "✓ GUARDADO" : "ACTUALIZAR CÓDIGO"}
                </button>
              </div>

              {codeErr && (
                <p className="text-[12px] font-medium" style={{ color: "#f87171" }}>{codeErr}</p>
              )}

              {profile?.joinCode && (
                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  Código activo: <span className="font-mono font-bold" style={{ color: "var(--text-secondary)" }}>{profile.joinCode}</span>
                </p>
              )}
            </div>
          )}
        </Section>

        {/* ── Tablón de Avisos ────────────────────── */}
        <Section title={`TABLÓN DE AVISOS · ${noticesLoading ? "—" : notices.length}`}>
          {noticesLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => <SkeletonBox key={i} w="100%" h="56px" />)}
            </div>
          ) : notices.length === 0 ? (
            <p className="text-[13px] py-4 text-center" style={{ color: "var(--text-tertiary)" }}>
              No hay avisos en la sala
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {notices.map(n => (
                <NoticeRow
                  key={n.id}
                  notice={n}
                  deleting={deletingNotice === n.id}
                  onDelete={() => deleteNotice(n.id)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* ── Roster del Equipo ───────────────────── */}
        <Section title={`ROSTER DEL EQUIPO · ${studentsLoading ? "—" : students.length}`}>
          {studentsLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => <SkeletonBox key={i} w="100%" h="60px" />)}
            </div>
          ) : students.length === 0 ? (
            <p className="text-[13px] py-4 text-center" style={{ color: "var(--text-tertiary)" }}>
              Sin alumnos vinculados
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {students.map((s, i) => (
                <RosterRow
                  key={s.id}
                  student={s}
                  last={i === students.length - 1}
                  confirmPending={unlinkConfirm === s.id}
                  unlinking={unlinking === s.id}
                  onUnlink={() => triggerUnlink(s.id)}
                />
              ))}
            </div>
          )}
        </Section>

      </div>
    </>
  );
}

/* ── Sub-components ──────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function TelemetryKpi({ label, value, accent = "var(--text-primary)" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl px-5 py-4" style={{ background: "var(--bg-surface-overlay)", border: "1px solid var(--border-subtle)" }}>
      <p className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: "var(--text-tertiary)" }}>{label}</p>
      <p
        className="tabular-nums font-black leading-none mt-2"
        style={{ fontSize: "clamp(28px, 6vw, 38px)", letterSpacing: "-0.04em", color: accent }}
      >
        {value}
      </p>
    </div>
  );
}

function NoticeRow({ notice, deleting, onDelete }: { notice: Notice; deleting: boolean; onDelete: () => void }) {
  const isCoach = notice.role === "COACH";
  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <span
        className="mt-0.5 shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
        style={{
          background: isCoach ? "#3b82f61a" : "#ffffff0d",
          color:      isCoach ? "#60a5fa"   : "var(--text-tertiary)",
        }}
      >
        {isCoach ? "COACH" : "ALUMNO"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>{notice.senderName}</p>
        <p className="text-[13px] mt-0.5 line-clamp-2" style={{ color: "var(--text-primary)" }}>{notice.content}</p>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>{fmtDate(notice.createdAt)}</p>
      </div>
      <button
        onClick={onDelete}
        disabled={deleting}
        aria-label="Eliminar aviso"
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 hover:opacity-70"
        style={{ background: "#f871711a", color: "#f87171" }}
      >
        {deleting ? "…" : "ELIMINAR"}
      </button>
    </div>
  );
}

const PAY_COLORS: Record<string, string> = {
  active: "#34d399", grace_period: "#fbbf24", past_due: "#fbbf24", inactive: "#f87171",
};
const PAY_LABELS: Record<string, string> = {
  active: "Al día", grace_period: "Pendiente", past_due: "Vencido", inactive: "Suspendido",
};

function RosterRow({
  student, last, confirmPending, unlinking, onUnlink,
}: {
  student: Student;
  last: boolean;
  confirmPending: boolean;
  unlinking: boolean;
  onUnlink: () => void;
}) {
  const payColor = PAY_COLORS[student.paymentStatus] ?? "#f87171";
  const payLabel = PAY_LABELS[student.paymentStatus] ?? "—";

  return (
    <div
      className="flex items-center gap-3 py-3.5 first:pt-0"
      style={{ borderBottom: last ? "none" : undefined }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white"
        style={{ background: student.avatarColor ?? "#3b82f6" }}
      >
        {student.avatarInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {student.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color: payColor }}>{payLabel}</span>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {student.completionRate}% adherencia
          </span>
        </div>
      </div>
      <button
        onClick={onUnlink}
        disabled={unlinking}
        className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40"
        style={{
          background: confirmPending ? "#f87171" : "#f871711a",
          color:      confirmPending ? "#000"     : "#f87171",
        }}
      >
        {unlinking ? "…" : confirmPending ? "¿CONFIRMAR?" : "DESVINCULAR"}
      </button>
    </div>
  );
}

function SkeletonBox({ w, h }: { w: string; h: string }) {
  return (
    <div
      className="rounded-xl animate-pulse"
      style={{ width: w, height: h, background: "var(--bg-surface-overlay)" }}
    />
  );
}
