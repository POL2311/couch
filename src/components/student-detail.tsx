"use client";

/* ═══════════════════════════════════════════
   Ficha del alumno (WEB) — paridad con la app:
   header fijo + 4 pestañas (Resumen, Entrenamiento,
   Nutrición, Progreso) con los mismos cálculos.
   ═══════════════════════════════════════════ */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Settings2, LayoutGrid, Dumbbell, Utensils, TrendingUp,
  AlertTriangle, CheckCircle2, ChevronDown, X, Loader2, CalendarDays,
  Pencil, Plus, Upload, UserCircle2, Camera,
} from "lucide-react";
import * as I from "@/lib/insights";
import type { BodyMeasurements } from "@/lib/mock-data";

const STAGES = ["Volumen", "Definición", "Mantenimiento", "Recomposición"];

const C = {
  bg:        "#000000",
  surface:   "#121212",
  raised:    "#1c1c1e",
  border:    "rgba(255,255,255,0.09)",
  primary:   "#f4f4f5",
  secondary: "#a1a1aa",
  tertiary:  "#52525b",
  success:   "#34d399",
  warning:   "#fb923c",
  danger:    "#f87171",
  info:      "#60a5fa",
};
type TabId = "resumen" | "entrenamiento" | "nutricion" | "progreso";
const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutGrid },
  { id: "entrenamiento", label: "Entreno", icon: Dumbbell },
  { id: "nutricion", label: "Nutrición", icon: Utensils },
  { id: "progreso", label: "Progreso", icon: TrendingUp },
];
const DAY_SHORT = ["L", "M", "X", "J", "V", "S", "D"];

export default function StudentDetailClient({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [detail, setDetail] = useState<I.StudentDetail | null>(null);
  const [logs, setLogs] = useState<I.ExerciseLog[]>([]);
  const [carreras, setCarreras] = useState<I.Carrera[]>([]);
  const [checks, setChecks] = useState<I.Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("resumen");
  const [manageOpen, setManageOpen] = useState(false);

  /* ── Inline profile edit ── */
  const [editProfile, setEditProfile]   = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: "", stage: "", weight: "", height: "", bodyFat: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);

  const load = useCallback(async () => {
    const [full, lg, rn, ck] = await Promise.all([
      fetch(`/api/students/${studentId}`).then((r) => r.json()),
      fetch(`/api/students/${studentId}/logs`).then((r) => r.json()),
      fetch(`/api/students/${studentId}/carreras`).then((r) => r.json()),
      fetch(`/api/students/${studentId}/checks`).then((r) => r.json()),
    ]);
    setStudent(full?.student ?? null);
    setDetail(full?.detail ?? null);
    setLogs(Array.isArray(lg) ? lg : []);
    setCarreras(Array.isArray(rn) ? rn : []);
    setChecks(Array.isArray(ck) ? ck : []);
  }, [studentId]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin" style={{ color: C.primary }} /></div>;
  if (!student || !detail) return <div className="p-10 text-center" style={{ color: C.tertiary }}>No se encontró el alumno.</div>;

  const wp = I.weightProgress(detail.weightHistory);

  /* Derive profile avatar: label="avatar" wins (most recent upload), then earliest Frente, then any */
  const allPhotosDesc: any[] = (detail as any).photos ?? [];
  const persistedAvatarUrl: string | null =
    allPhotosDesc.find((p: any) => p.label === "avatar")?.url ??
    [...allPhotosDesc].reverse().find((p: any) => /frente/i.test(p.label ?? ""))?.url ??
    allPhotosDesc[allPhotosDesc.length - 1]?.url ??
    null;
  const displayAvatarUrl = avatarPreview ?? persistedAvatarUrl;

  const openProfileEdit = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileDraft({
      name:    student.name,
      stage:   student.stage,
      weight:  String(student.currentWeight),
      height:  String((detail as any).height ?? ""),
      bodyFat: String((detail as any).bodyFat ?? ""),
    });
    setEditProfile(true);
  };
  const cancelProfileEdit = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditProfile(false);
  };
  const saveProfile = async () => {
    setSavingProfile(true);
    if (avatarFile) {
      const fd = new FormData();
      fd.append("photo", avatarFile);
      fd.append("label", "avatar");
      await fetch(`/api/students/${studentId}/photos`, { method: "POST", body: fd });
      URL.revokeObjectURL(avatarPreview!);
      setAvatarPreview(null);
      setAvatarFile(null);
    }
    await fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentUpdates: {
          name:          profileDraft.name.trim() || student.name,
          stage:         profileDraft.stage,
          stageNumber:   STAGES.indexOf(profileDraft.stage) + 1 || student.stageNumber,
          currentWeight: parseFloat(profileDraft.weight) || student.currentWeight,
          previousWeight: student.currentWeight,
        },
        detailUpdates: {
          ...(profileDraft.height  && { height:  parseFloat(profileDraft.height)  }),
          ...(profileDraft.bodyFat && { bodyFat: parseFloat(profileDraft.bodyFat) }),
        },
      }),
    });
    setSavingProfile(false);
    setEditProfile(false);
    load();
  };

  const pd = (k: keyof typeof profileDraft, v: string) =>
    setProfileDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pb-16">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 pt-4 pb-3" style={{ background: C.bg }}>
        <div className="flex items-start gap-3 mb-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <ChevronLeft size={18} style={{ color: C.secondary }} />
          </button>

          {/* ── Profile avatar ── */}
          <div className="shrink-0 relative">
            {/* Golden gradient ring */}
            <div className="h-20 w-20 md:h-28 md:w-28 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-[3px] shadow-[0_0_18px_rgba(250,204,21,0.22)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                {displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt={student.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <UserCircle2
                    className="w-9 h-9 md:w-12 md:h-12"
                    strokeWidth={1.25}
                    style={{ color: C.tertiary }}
                  />
                )}
              </div>
            </div>

            {/* Camera overlay — visible only in edit mode */}
            {editProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full flex items-end justify-center pb-1.5 cursor-pointer"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 38%, transparent 100%)" }}
              >
                <Camera size={16} style={{ color: "#fff" }} />
              </button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            {editProfile ? (
              /* Edit mode */
              <>
                <input value={profileDraft.name}
                  onChange={(e) => pd("name", e.target.value)}
                  placeholder="Nombre"
                  className="w-full text-[17px] font-semibold bg-transparent outline-none border-b pb-0.5 mb-2"
                  style={{ color: C.primary, borderColor: C.border }}
                  autoFocus />
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {STAGES.map((s) => (
                    <button key={s} onClick={() => pd("stage", s)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer"
                      style={{
                        background: profileDraft.stage === s ? "rgba(255,255,255,0.12)" : C.raised,
                        border: `1px solid ${profileDraft.stage === s ? "rgba(255,255,255,0.25)" : C.border}`,
                        color: profileDraft.stage === s ? C.primary : C.tertiary,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([["weight","Peso (kg)"],["height","Estatura (cm)"],["bodyFat","% Grasa"]] as const).map(([k, lbl]) => (
                    <div key={k}>
                      <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.tertiary }}>{lbl}</p>
                      <input value={profileDraft[k]} onChange={(e) => pd(k, e.target.value)}
                        type="number" step="0.1" placeholder="—"
                        className="w-full bg-transparent outline-none text-[13px] font-medium border-b pb-0.5"
                        style={{ color: C.primary, borderColor: C.border }} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Static display */
              <>
                <p className="text-[18px] font-semibold truncate" style={{ color: C.primary }}>{student.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.07)", color: C.secondary }}>{student.stage}</span>
                  <span className="text-[13px]" style={{ color: C.secondary }}>
                    {student.currentWeight} kg{wp.delta !== 0 ? ` · ${wp.delta > 0 ? "+" : ""}${wp.delta}` : ""}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            {editProfile ? (
              <>
                <button onClick={cancelProfileEdit}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer"
                  style={{ color: C.tertiary }}>
                  Cancelar
                </button>
                <button onClick={saveProfile} disabled={savingProfile}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: C.info, color: "#000" }}>
                  {savingProfile ? <Loader2 size={12} className="animate-spin" /> : "Guardar"}
                </button>
              </>
            ) : (
              <button onClick={openProfileEdit}
                className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <Pencil size={13} style={{ color: C.secondary }} />
              </button>
            )}
            <button onClick={() => setManageOpen(true)}
              className="flex items-center gap-1.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer shrink-0 px-2 md:px-3"
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.secondary }}>
              <Settings2 size={14} />
              <span className="hidden md:inline">Gestionar</span>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex flex-row items-center gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-colors whitespace-nowrap min-w-0"
                style={{ background: active ? "rgba(255,255,255,0.09)" : "transparent", color: active ? C.primary : C.tertiary }}>
                <t.icon size={13} className="shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        {tab === "resumen"       && <SummaryTab student={student} detail={detail} logs={logs} carreras={carreras} checks={checks} onGoTo={setTab} />}
        {tab === "entrenamiento" && <TrainingTab detail={detail} logs={logs} onManage={() => setManageOpen(true)} />}
        {tab === "nutricion"     && <NutritionTab detail={detail} checks={checks} onManage={() => setManageOpen(true)} />}
        {tab === "progreso"      && <ProgressTab detail={detail} carreras={carreras} studentId={studentId} onRefresh={load} />}
      </div>

      {manageOpen && <ManageModal studentId={studentId} currentStage={student.stage} onClose={() => setManageOpen(false)} onApplied={() => { setManageOpen(false); load(); }} />}
    </div>
  );
}

function Card({ title, right, children }: { title?: string; right?: any; children: any }) {
  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
      {title && <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}><span className="text-[13px] font-semibold tracking-wide" style={{ color: C.primary }}>{title}</span>{right}</div>}
      {children}
    </div>
  );
}
function Sparkline({ data, color = C.success, height = 70, suffix = "" }: { data: number[]; color?: string; height?: number; suffix?: string }) {
  if (!data || data.length < 2) return <span className="text-[12px]" style={{ color: C.tertiary }}>Sin datos suficientes</span>;
  const W = 320, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${height - ((v - min) / range) * (height - 14) - 7}`).join(" ");
  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="flex justify-between mt-1.5 text-[11px]"><span style={{ color: C.tertiary }}>{data[0]}{suffix}</span><span className="font-medium" style={{ color: C.primary }}>{data[data.length - 1]}{suffix}</span></div>
    </div>
  );
}
function Bars({ data, color = C.info, height = 80 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  if (!data.length) return <span className="text-[12px]" style={{ color: C.tertiary }}>Sin datos</span>;
  const max = Math.max(...data.map((d) => d.value)) || 1, W = 320, gap = 6, bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">{data.map((d, i) => { const h = Math.max((d.value / max) * (height - 6), 2); return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} rx={3} fill={color} opacity={0.85} />; })}</svg>
      <div className="flex justify-between mt-1.5">{data.map((d, i) => <span key={i} className="text-[9px] text-center" style={{ width: bw, color: C.tertiary }}>{d.label}</span>)}</div>
    </div>
  );
}
function silhouettePath(track: any[], W: number, H: number, pad = 10): string {
  if (!track || track.length < 2) return "";
  const lats = track.map((p) => p.lat), lngs = track.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const meanLat = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const spanLat = maxLat - minLat || 1e-6, spanLng = (maxLng - minLng) * Math.cos(meanLat) || 1e-6;
  const w = W - pad * 2, h = H - pad * 2, scale = Math.min(w / spanLng, h / spanLat);
  const offX = pad + (w - spanLng * scale) / 2, offY = pad + (h - spanLat * scale) / 2;
  return track.map((p, i) => `${i === 0 ? "M" : "L"} ${(offX + (p.lng - minLng) * Math.cos(meanLat) * scale).toFixed(1)} ${(offY + (maxLat - p.lat) * scale).toFixed(1)}`).join(" ");
}

function SummaryTab({ student, detail, logs, carreras, checks, onGoTo }: any) {
  const lastAct = useMemo(() => I.lastActivityDate(logs, carreras, detail.weightHistory), [logs, carreras, detail]);
  const wk = I.trainingLastDays(logs, detail.routine, lastAct ?? I.todayStr(), 7);
  const diet = I.dietComplianceRecent(checks, detail);
  const wp = I.weightProgress(detail.weightHistory);
  const daysAgo = lastAct ? I.daysBetween(lastAct, I.todayStr()) : null;
  const flags = I.redFlags(detail, logs, checks, student.paymentStatus);
  const [weekStart, setWeekStart] = useState(() => I.weekStartOf(lastAct ?? I.todayStr()));
  const [selDate, setSelDate] = useState<string | null>(null);
  const days = I.weekDays(weekStart);
  const trainedSet = useMemo(() => new Set(logs.map((l: any) => l.date)), [logs]);
  const mealSet = useMemo(() => new Set(checks.filter((c: any) => c.kind === "meal").map((c: any) => c.date)), [checks]);
  const lastLabel = daysAgo === null ? "—" : daysAgo <= 0 ? "Hoy" : daysAgo === 1 ? "Ayer" : `${daysAgo} días`;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Kpi label="Peso" value={`${wp.current}`} unit="kg" sub={wp.delta !== 0 ? `${wp.delta > 0 ? "+" : ""}${wp.delta} kg` : "—"} />
        <Kpi label="Entreno (sem)" value={`${wk.done}/${wk.planned}`} accent={wk.done >= wk.planned ? C.success : wk.done === 0 ? C.danger : C.warning} />
        <Kpi label="Dieta" value={diet.days ? `${diet.pct}%` : "—"} sub={diet.days ? `${diet.days} días` : "sin registro"} accent={diet.pct >= 80 ? C.success : diet.days ? C.warning : C.tertiary} />
        <Kpi label="Últ. actividad" value={lastLabel} />
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        {flags.length === 0 ? (
          <div className="flex items-center gap-2"><CheckCircle2 size={16} style={{ color: C.success }} /><span className="text-[13px]" style={{ color: C.secondary }}>Todo en orden — sin focos rojos.</span></div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] uppercase font-medium tracking-wider" style={{ color: C.tertiary }}>Focos rojos</p>
            {flags.map((f, i) => <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(248,113,113,0.1)" }}><AlertTriangle size={14} style={{ color: C.danger }} /><span className="text-[13px]" style={{ color: C.danger }}>{f}</span></div>)}
          </div>
        )}
      </div>

      <Card title="Peso" right={<button onClick={() => onGoTo("progreso")} className="text-[12px] cursor-pointer" style={{ color: C.tertiary }}>Ver todo</button>}>
        <div className="p-5"><Sparkline data={detail.weightHistory.map((w: any) => w.weight)} /></div>
      </Card>

      <Card title="Resumen por día" right={<span className="text-[12px]" style={{ color: C.tertiary }}>Toca un día</span>}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <button onClick={() => setWeekStart(I.addDays(weekStart, -7))} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: C.raised }}><ChevronLeft size={16} style={{ color: C.secondary }} /></button>
          <div className="flex items-center gap-2"><CalendarDays size={14} style={{ color: C.tertiary }} /><input type="date" value={selDate ?? days[0]} onChange={(e) => { if (e.target.value) { setWeekStart(I.weekStartOf(e.target.value)); setSelDate(e.target.value); } }} className="bg-transparent text-[12px]" style={{ color: C.secondary }} /></div>
          <button onClick={() => setWeekStart(I.addDays(weekStart, 7))} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: C.raised }}><ChevronRight size={16} style={{ color: C.secondary }} /></button>
        </div>
        <div className="flex px-3 pb-4">
          {days.map((date, i) => (
            <button key={date} onClick={() => setSelDate(date)} className="flex-1 flex flex-col items-center py-2 mx-0.5 rounded-xl cursor-pointer" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="text-[10px] font-medium" style={{ color: C.tertiary }}>{DAY_SHORT[i]}</span>
              <span className="text-[14px] font-semibold mt-0.5" style={{ color: C.secondary }}>{parseInt(date.split("-")[2])}</span>
              <span className="flex gap-1 mt-1.5 h-1.5">{trainedSet.has(date) && <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.info }} />}{mealSet.has(date) && <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }} />}</span>
            </button>
          ))}
        </div>
      </Card>

      {selDate && <DaySummary date={selDate} logs={logs} checks={checks} detail={detail} onClose={() => setSelDate(null)} />}
    </div>
  );
}
function Kpi({ label, value, unit, sub, accent = C.primary }: any) {
  return (
    <div className="rounded-xl p-4 flex flex-col justify-between"
      style={{ background: C.surface, border: `1px solid ${C.border}`, minHeight: 110, boxShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
      <p className="text-[10px] uppercase font-medium tracking-widest" style={{ color: C.tertiary }}>{label}</p>
      <div>
        <p className="text-[24px] font-semibold leading-none mt-2" style={{ color: accent }}>
          {value}{unit && <span className="text-[12px] font-normal ml-1" style={{ color: C.secondary }}>{unit}</span>}
        </p>
        {sub && <p className="text-[11px] mt-1.5 font-medium" style={{ color: C.secondary }}>{sub}</p>}
      </div>
    </div>
  );
}
function DaySummary({ date, logs, checks, detail, onClose }: any) {
  const s = I.daySummary(date, logs, checks, detail);
  const planMeals = detail.diet?.meals ?? [];
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0" style={{ background: "rgba(0,0,0,0.72)" }} />
      <div className="relative w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 z-10 max-h-[85vh] overflow-y-auto" style={{ background: C.surface, border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><div><p className="text-[18px] font-semibold" style={{ color: C.primary }}>{I.prettyDate(date)}</p><p className="text-[12px]" style={{ color: C.tertiary }}>Resumen del día</p></div><button onClick={onClose} className="cursor-pointer"><X size={18} style={{ color: C.tertiary }} /></button></div>
        <p className="text-[13px] font-medium mb-2 flex items-center gap-2" style={{ color: C.secondary }}><Dumbbell size={15} style={{ color: C.info }} /> Entrenamiento</p>
        {!s.trained ? <div className="rounded-xl p-4 mb-4" style={{ background: C.raised }}><span className="text-[13px]" style={{ color: C.tertiary }}>No registró entrenamiento.</span></div> : (
          <div className="rounded-xl overflow-hidden mb-4" style={{ background: C.raised }}>{s.exercises.map((ex: any, i: number) => (
            <div key={ex.id} className="px-4 py-3" style={{ borderBottom: i < s.exercises.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <p className="text-[13px] font-medium" style={{ color: C.primary }}>{ex.exerciseName}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">{ex.sets.map((st: any, j: number) => <span key={j} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: st.done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", color: st.done ? C.success : C.secondary }}>{st.reps || "—"}{!ex.bodyweight && st.weight ? `×${st.weight}` : " reps"}</span>)}</div>
            </div>))}</div>
        )}
        <p className="text-[13px] font-medium mb-2 flex items-center gap-2" style={{ color: C.secondary }}><Utensils size={15} style={{ color: C.success }} /> Comidas <span className="ml-auto text-[12px]" style={{ color: C.tertiary }}>{s.mealsDone.length}/{s.mealsTotal}</span></p>
        <div className="rounded-xl overflow-hidden" style={{ background: C.raised }}>{planMeals.map((m: any, i: number) => { const done = s.mealsDone.includes(m.name); return (
          <div key={i} className="flex items-center px-4 py-3" style={{ borderBottom: i < planMeals.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: done ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${done ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)"}` }}>{done && <CheckCircle2 size={12} style={{ color: C.success }} />}</span>
            <span className="text-[13px] ml-3 flex-1" style={{ color: done ? C.secondary : C.tertiary }}>{m.time} · {m.name}</span>
          </div>); })}</div>
      </div>
    </div>
  );
}

function TrainingTab({ detail, logs, onManage }: any) {
  const lastAct = logs.length ? logs.map((l: any) => l.date).sort().slice(-1)[0] : I.todayStr();
  const [weekStart, setWeekStart] = useState(() => I.weekStartOf(lastAct));
  const week = I.weekTraining(logs, detail.routine, weekStart);
  const recs = I.records(logs).slice(0, 6);
  const vol = I.volumeByDate(logs).slice(-8);
  const exercises = I.byExercise(logs);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(6);
  const toggle = (n: string) => setExpanded((p) => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s; });
  const STC: any = { done: C.success, missed: C.danger, rest: "#3a3a3c" };
  const STB: any = { done: "rgba(52,211,153,0.12)", missed: "rgba(248,113,113,0.12)", rest: "rgba(255,255,255,0.04)" };
  const hasRoutine = (detail.routine?.days?.length ?? 0) > 0;

  return (
    <div>
      {/* Routine empty state — shown above all cards when no template is assigned */}
      {!hasRoutine && (
        <div className="rounded-xl p-6 mb-4 flex flex-col items-center gap-3"
          style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          <Dumbbell size={26} strokeWidth={1.25} style={{ color: C.tertiary }} />
          <div className="text-center">
            <p className="text-[14px] font-semibold" style={{ color: C.secondary }}>Sin rutina asignada</p>
            <p className="text-[12px] mt-1" style={{ color: C.tertiary }}>El alumno no verá ningún entrenamiento hasta que asignes una plantilla.</p>
          </div>
          <button onClick={onManage}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: `${C.info}18`, border: `1px solid ${C.info}40`, color: C.info }}>
            <Dumbbell size={13} /> Asignar rutina
          </button>
        </div>
      )}
      <Card title="Cumplimiento semanal" right={<span className="text-[13px] font-semibold" style={{ color: week.done >= week.planned ? C.success : week.done === 0 ? C.danger : C.warning }}>{week.done}/{week.planned}</span>}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <button onClick={() => setWeekStart(I.addDays(weekStart, -7))} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: C.raised }}><ChevronLeft size={16} style={{ color: C.secondary }} /></button>
          <span className="text-[12px] font-medium" style={{ color: C.secondary }}>{I.fmtShort(week.byDay[0].date)} – {I.fmtShort(week.byDay[6].date)}</span>
          <button onClick={() => setWeekStart(I.addDays(weekStart, 7))} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: C.raised }}><ChevronRight size={16} style={{ color: C.secondary }} /></button>
        </div>
        <div className="flex px-3 pb-3">{week.byDay.map((d, i) => (
          <div key={d.date} className="flex-1 flex flex-col items-center mx-0.5 py-2 rounded-xl" style={{ background: STB[d.status] }}>
            <span className="text-[10px] font-medium" style={{ color: C.tertiary }}>{DAY_SHORT[i]}</span>
            <span className="w-6 h-6 rounded-full flex items-center justify-center mt-1.5 text-[10px] font-bold" style={{ background: STC[d.status], color: d.status === "rest" ? C.secondary : "#000" }}>{parseInt(d.date.split("-")[2])}</span>
          </div>))}</div>
        <div className="flex gap-4 px-4 pb-4 text-[11px]" style={{ color: C.tertiary }}>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: STC.done }} />Entrenó</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: STC.missed }} />No entrenó</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: STC.rest }} />Descanso</span>
        </div>
      </Card>

      <Card title="Récords (mejor peso)">
        {recs.length === 0 ? <p className="text-[13px] p-5" style={{ color: C.tertiary }}>Sin récords con peso aún.</p> : (
          <div className="p-3 grid grid-cols-2 gap-2">{recs.map((r) => <div key={r.name} className="rounded-xl px-3 py-2.5" style={{ background: C.raised }}><p className="text-[11px] truncate" style={{ color: C.tertiary }}>{r.name}</p><p className="text-[16px] font-semibold mt-0.5" style={{ color: C.primary }}>{r.weight} kg</p></div>)}</div>
        )}
      </Card>

      <Card title="Carga total por sesión (kg×reps)"><div className="p-5">{vol.length < 2 ? <p className="text-[13px]" style={{ color: C.tertiary }}>Pocas sesiones.</p> : <Bars data={vol.map((v) => ({ label: I.fmtShort(v.date), value: v.volume }))} />}</div></Card>

      <Card title="Historial por ejercicio">
        {exercises.length === 0 ? <p className="text-[13px] p-5" style={{ color: C.tertiary }}>Sin sesiones registradas.</p> : (
          <>
            {exercises.slice(0, visible).map((ex, idx) => {
              const open = expanded.has(ex.name); const series = ex.sessions.map((s) => I.maxWeight(s)).filter((w) => w > 0);
              return (
                <div key={ex.name} style={{ borderTop: idx === 0 ? "none" : `1px solid ${C.border}` }}>
                  <button onClick={() => toggle(ex.name)} className="w-full flex items-center px-5 py-3.5 text-left cursor-pointer">
                    <div className="flex-1"><p className="text-[13px] font-medium" style={{ color: C.primary }}>{ex.name}</p><p className="text-[11px] mt-0.5" style={{ color: C.tertiary }}>{ex.muscleGroup ?? ""} · {ex.sessions.length} sesiones</p></div>
                    <ChevronDown size={16} style={{ color: C.tertiary, transform: open ? "rotate(180deg)" : "none" }} />
                  </button>
                  {open && <div className="px-5 pb-4 space-y-3">
                    {!ex.bodyweight && series.length >= 2 && <div className="rounded-xl p-3" style={{ background: C.raised }}><p className="text-[11px] mb-1" style={{ color: C.tertiary }}>Progresión de peso máx</p><Sparkline data={series} color={C.info} height={50} suffix=" kg" /></div>}
                    {[...ex.sessions].reverse().map((s) => (
                      <div key={s.id} className="rounded-xl p-3" style={{ background: C.raised }}>
                        <div className="flex items-center justify-between"><span className="text-[12px] font-medium" style={{ color: C.secondary }}>{I.prettyDate(s.date)}</span><span className="text-[11px]" style={{ color: C.tertiary }}>prescrito {s.prescribedSets}×{s.prescribedReps}{s.prescribedWeight ? ` @ ${s.prescribedWeight}` : ""}</span></div>
                        <div className="flex flex-wrap gap-1.5 mt-2">{s.sets.map((st, j) => <span key={j} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: st.done ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", color: st.done ? C.success : C.secondary }}>{st.reps || "—"}{!ex.bodyweight && st.weight ? `×${st.weight}` : " reps"}</span>)}</div>
                      </div>))}
                  </div>}
                </div>
              );
            })}
            {exercises.length > visible && <button onClick={() => setVisible((v) => v + 6)} className="w-full px-5 py-3.5 text-[13px] font-medium cursor-pointer" style={{ borderTop: `1px solid ${C.border}`, color: C.secondary }}>Cargar más ({exercises.length - visible})</button>}
          </>
        )}
      </Card>
    </div>
  );
}

function NutritionTab({ detail, checks, onManage }: any) {
  const [date, setDate] = useState(() => I.lastDietDate(checks));
  const meals = detail.diet?.meals ?? [];
  const macros = detail.diet?.macros ?? { protein: 0, carbs: 0, fat: 0 };
  const doneNames = I.mealsDoneOn(checks, date);
  const trend = I.dietComplianceByDate(checks, detail).slice(-10);
  const recent = I.dietComplianceRecent(checks, detail);
  const total = meals.length, done = Math.min(doneNames.length, total), pct = total ? Math.round((done / total) * 100) : 0, hasRec = doneNames.length > 0;

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setDate(I.addDays(date, -1))} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: C.raised }}><ChevronLeft size={16} style={{ color: C.secondary }} /></button>
          <div className="flex items-center gap-2"><CalendarDays size={15} style={{ color: C.tertiary }} /><input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="bg-transparent text-[14px] font-medium" style={{ color: C.primary }} /></div>
          <button onClick={() => setDate(I.addDays(date, 1))} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: C.raised }}><ChevronRight size={16} style={{ color: C.secondary }} /></button>
        </div>
      </Card>
      <div className="rounded-2xl p-5 mb-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3"><span className="text-[11px] uppercase font-medium tracking-wider" style={{ color: C.tertiary }}>Cumplimiento del día</span><span className="text-[14px] font-semibold" style={{ color: !hasRec ? C.tertiary : pct >= 80 ? C.success : C.warning }}>{hasRec ? `${done}/${total} · ${pct}%` : "sin registro"}</span></div>
        <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}><div className="h-full rounded-full" style={{ width: `${hasRec ? pct : 0}%`, background: pct >= 80 ? C.success : C.warning }} /></div>
      </div>
      <Card title={detail.diet?.name || "Dieta no asignada"} right={detail.diet?.totalCalories ? <span className="text-[12px] font-semibold" style={{ color: C.secondary }}>{detail.diet.totalCalories} kcal</span> : null}>
        {total === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <Utensils size={26} strokeWidth={1.25} style={{ color: C.tertiary }} />
            <div className="text-center">
              <p className="text-[14px] font-semibold" style={{ color: C.secondary }}>Sin dieta asignada</p>
              <p className="text-[12px] mt-1" style={{ color: C.tertiary }}>El alumno no verá ningún plan hasta que asignes uno.</p>
            </div>
            <button onClick={onManage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer transition-opacity hover:opacity-80"
              style={{ background: `${C.info}18`, border: `1px solid ${C.info}40`, color: C.info }}>
              <Utensils size={13} /> Asignar dieta
            </button>
          </div>
        ) : (<>
          <div className="grid grid-cols-3 gap-2 p-4">
            {[["Proteína", macros.protein, C.info], ["Carbos", macros.carbs, C.warning], ["Grasa", macros.fat, "#f472b6"]].map(([l, v, col]) => (
              <div key={l as string} className="rounded-xl py-3 text-center" style={{ background: C.raised }}>
                <p className="text-[18px] font-bold" style={{ color: col as string }}>{v as any}<span className="text-[10px] font-normal ml-0.5" style={{ color: C.tertiary }}>g</span></p>
                <p className="text-[10px] mt-0.5 uppercase tracking-wide font-medium" style={{ color: C.secondary }}>{l}</p>
              </div>
            ))}
          </div>
          {meals.map((m: any, i: number) => { const marked = doneNames.includes(m.name); return (
            <div key={i} className="flex items-center px-5 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: marked ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${marked ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.12)"}` }}>
                {marked && <CheckCircle2 size={12} style={{ color: C.success }} />}
              </span>
              <div className="flex-1 ml-3 min-w-0">
                <p className="text-[13px] font-medium" style={{ color: marked ? C.primary : C.secondary }}>{m.time} · {m.name}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: C.tertiary }}>{m.items.join(" · ")}</p>
              </div>
              <span className="text-[12px] font-medium tabular-nums shrink-0 ml-3" style={{ color: C.secondary }}>{m.calories} kcal</span>
            </div>); })}
        </>)}
      </Card>
      <Card title="Cumplimiento reciente" right={recent.days > 0 ? <span className="text-[12px]" style={{ color: C.tertiary }}>{recent.pct}% · {recent.days} días</span> : null}>
        <div className="p-5">{trend.length < 2 ? <p className="text-[13px]" style={{ color: C.tertiary }}>Aún no hay suficientes días.</p> : <Bars data={trend.map((d) => ({ label: I.fmtShort(d.date), value: Math.round((d.done / (d.total || 1)) * 100) }))} color={C.success} />}</div>
      </Card>
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(96,165,250,0.08)" }}><AlertTriangle size={14} style={{ color: C.info, marginTop: 1 }} /><span className="text-[12px]" style={{ color: C.secondary }}>El cumplimiento se basa en las comidas que el alumno marca. El registro de alimentos consumidos llegará en una fase futura.</span></div>
    </div>
  );
}

const MEAS_FIELDS = [
  ["Pecho",   "chest"]  as const,
  ["Cintura", "waist"]  as const,
  ["Cadera",  "hips"]   as const,
  ["Brazo I", "armL"]   as const,
  ["Brazo D", "armR"]   as const,
  ["Muslo I", "thighL"] as const,
  ["Muslo D", "thighR"] as const,
];

function PhotoUpload({ studentId, monthLabel, onDone }: { studentId: string; monthLabel: string; onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  const upload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("label", monthLabel);
    await fetch(`/api/students/${studentId}/photos`, { method: "POST", body: fd });
    setUploading(false);
    onDone();
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
      className="rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
      style={{
        aspectRatio: "3/4",
        background: dragOver ? "rgba(96,165,250,0.1)" : C.raised,
        border: `1.5px dashed ${dragOver ? C.info : C.border}`,
      }}>
      {uploading
        ? <Loader2 size={18} className="animate-spin" style={{ color: C.tertiary }} />
        : <>
            <Plus size={18} style={{ color: C.tertiary }} />
            <span className="text-[9px] text-center px-1" style={{ color: C.tertiary }}>Subir foto</span>
          </>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
    </div>
  );
}

function ProgressTab({ detail, carreras, studentId, onRefresh }: any) {
  const allMeasurements: BodyMeasurements[] = useMemo(
    () => [...(detail.measurements ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [detail.measurements],
  );

  const [activeMonthIdx, setActiveMonthIdx] = useState(() => Math.max(0, allMeasurements.length - 1));
  const justAddedRef = useRef(false);

  /* Keep active tab on last month whenever new month is added */
  useEffect(() => {
    if (justAddedRef.current) {
      justAddedRef.current = false;
      setActiveMonthIdx(allMeasurements.length - 1);
    }
  }, [allMeasurements.length]);

  const activeMeas: BodyMeasurements | undefined = allMeasurements[activeMonthIdx];

  /* Inline measurement editing */
  const [editMeas, setEditMeas]   = useState(false);
  const [measDraft, setMeasDraft] = useState<Record<string, string>>({});
  const [savingMeas, setSavingMeas] = useState(false);
  const [addingMonth, setAddingMonth] = useState(false);

  const openMeasEdit = () => {
    const d: Record<string, string> = {};
    MEAS_FIELDS.forEach(([, k]) => { d[k] = activeMeas ? String((activeMeas as any)[k] ?? "") : ""; });
    setMeasDraft(d);
    setEditMeas(true);
  };
  const saveMeas = async () => {
    if (!activeMeas?.id) return;
    setSavingMeas(true);
    const payload: Record<string, unknown> = { id: activeMeas.id };
    MEAS_FIELDS.forEach(([, k]) => { if (measDraft[k] !== "") payload[k] = parseFloat(measDraft[k]); });
    await fetch(`/api/students/${studentId}/measurements`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSavingMeas(false);
    setEditMeas(false);
    onRefresh();
  };

  const addMonth = async () => {
    setAddingMonth(true);
    await fetch(`/api/students/${studentId}/measurements`, { method: "POST" });
    justAddedRef.current = true;
    setAddingMonth(false);
    onRefresh();
  };

  /* Weight chart */
  const [wRange, setWRange] = useState(6);
  const wh = I.weightInRange(detail.weightHistory, wRange);
  const wp = I.weightProgress(wh);
  const RANGES = [{ label: "1m", m: 1 }, { label: "3m", m: 3 }, { label: "6m", m: 6 }, { label: "Todo", m: 0 }];

  /* Photos grouped per month */
  const allPhotos: any[] = detail.photos ?? [];
  const monthPhotos = useMemo(() => {
    if (!activeMeas) return allPhotos;
    const monthNum = activeMonthIdx + 1;
    const re = new RegExp(`^Mes\\s*${monthNum}\\b`, "i");
    return allPhotos.filter((p: any) => re.test(p.label ?? ""));
  }, [allPhotos, activeMeas, activeMonthIdx]);

  const fmtDistance = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
  const fmtDuration = (s: number) => { const mm = Math.floor(s / 60), ss = Math.floor(s % 60); return `${mm}:${String(ss).padStart(2, "0")}`; };

  return (
    <div>
      {/* ── Weight chart ── */}
      <Card title="Peso" right={<span className="text-[13px] font-medium" style={{ color: wp.delta < 0 ? C.success : wp.delta > 0 ? C.warning : C.tertiary }}>{wp.delta !== 0 ? `${wp.delta > 0 ? "+" : ""}${wp.delta} kg` : "—"}</span>}>
        <div className="flex gap-2 px-4 pt-3">{RANGES.map((r) => { const a = wRange === r.m; return <button key={r.label} onClick={() => setWRange(r.m)} className="flex-1 py-2 rounded-lg text-[12px] font-medium cursor-pointer" style={{ background: a ? "rgba(255,255,255,0.08)" : C.raised, color: a ? C.primary : C.tertiary }}>{r.label}</button>; })}</div>
        <div className="p-5">{wh.length < 2 ? <p className="text-[13px]" style={{ color: C.tertiary }}>Pocos datos en este rango.</p> : <Sparkline data={wh.map((w) => w.weight)} suffix=" kg" height={90} />}</div>
      </Card>

      {/* ── Month timeline ── */}
      <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          <span className="text-[12px] font-semibold flex-1" style={{ color: C.primary }}>Registros por Mes</span>
          <button onClick={addMonth} disabled={addingMonth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-40"
            style={{ background: `${C.info}18`, border: `1px solid ${C.info}30`, color: C.info }}>
            {addingMonth ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
            Añadir Mes
          </button>
        </div>
        {/* Scrollable month tabs */}
        <div className="flex gap-2 px-3 py-3 overflow-x-auto">
          {allMeasurements.length === 0 ? (
            <p className="text-[12px] px-1 py-1" style={{ color: C.tertiary }}>Sin registros — añade el primer mes.</p>
          ) : (
            allMeasurements.map((m, i) => {
              const active = i === activeMonthIdx;
              return (
                <button key={m.id ?? i} onClick={() => { setActiveMonthIdx(i); setEditMeas(false); }}
                  className="flex-shrink-0 px-3.5 py-2 rounded-xl text-[12px] font-semibold cursor-pointer whitespace-nowrap"
                  style={{
                    background: active ? "rgba(255,255,255,0.1)" : C.raised,
                    border: `1px solid ${active ? "rgba(255,255,255,0.2)" : C.border}`,
                    color: active ? C.primary : C.tertiary,
                  }}>
                  Mes {i + 1}
                  <span className="ml-1.5 text-[10px] font-normal" style={{ color: active ? C.secondary : C.tertiary }}>
                    {m.date}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Active month: measurements */}
        {activeMeas && (
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.tertiary }}>Medidas · Mes {activeMonthIdx + 1}</span>
              {!editMeas ? (
                <button onClick={openMeasEdit}
                  className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                  style={{ background: C.raised, border: `1px solid ${C.border}` }}>
                  <Pencil size={12} style={{ color: C.secondary }} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditMeas(false)} className="text-[11px] cursor-pointer" style={{ color: C.tertiary }}>Cancelar</button>
                  <button onClick={saveMeas} disabled={savingMeas}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                    style={{ background: C.info, color: "#000" }}>
                    {savingMeas ? <Loader2 size={11} className="animate-spin" /> : "Guardar"}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 pb-3">
              {MEAS_FIELDS.map(([lbl, k]) => {
                const v = (activeMeas as any)[k];
                return (
                  <div key={k} className="rounded-xl p-2.5" style={{ background: C.raised }}>
                    {editMeas ? (
                      <>
                        <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: C.tertiary }}>{lbl}</p>
                        <input value={measDraft[k] ?? ""} onChange={(e) => setMeasDraft((d) => ({ ...d, [k]: e.target.value }))}
                          type="number" step="0.1" placeholder="0"
                          className="w-full bg-transparent text-[16px] font-bold outline-none"
                          style={{ color: C.primary }} />
                      </>
                    ) : (
                      <>
                        <p className="text-[20px] font-bold leading-none" style={{ color: C.primary }}>
                          {v ?? "—"}<span className="text-[10px] font-normal ml-0.5" style={{ color: C.tertiary }}>cm</span>
                        </p>
                        <p className="text-[10px] font-medium mt-1" style={{ color: C.secondary }}>{lbl}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Photos for active month ── */}
      <Card title={`Fotos · Mes ${activeMonthIdx + 1}`}>
        <div className="grid grid-cols-3 p-3 gap-2">
          {monthPhotos.map((p: any) => (
            <div key={p.id}>
              <img src={p.url} alt={p.label} className="w-full rounded-xl object-cover" style={{ aspectRatio: "3/4", background: C.raised }} />
              <p className="text-[10px] mt-1 text-center truncate" style={{ color: C.tertiary }}>{p.label}{p.weight ? ` · ${p.weight}kg` : ""}</p>
            </div>
          ))}
          {/* Upload dropzone */}
          <PhotoUpload studentId={studentId} monthLabel={`Mes ${activeMonthIdx + 1}`} onDone={onRefresh} />
        </div>
      </Card>

      {/* ── MD-Route carreras ── */}
      <Card title={`MD-Route · Carreras (${carreras.length})`}>
        {carreras.length === 0 ? <p className="text-[13px] p-5" style={{ color: C.tertiary }}>Sin carreras.</p> : (
          <div className="p-3 space-y-3">{carreras.map((c: any) => (
            <div key={c.id} className="rounded-xl overflow-hidden" style={{ background: C.raised }}>
              <div className="flex justify-center py-2"><svg width={220} height={80}><path d={silhouettePath(c.track, 220, 80)} fill="none" stroke={C.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <div className="flex justify-between px-4 py-2.5 text-[12px]" style={{ borderTop: `1px solid ${C.border}` }}><span style={{ color: C.tertiary }}>{c.date}</span><div className="flex gap-4" style={{ color: C.secondary }}><span>{fmtDistance(c.distanceM)}</span><span>{fmtDuration(c.durationS)}</span><span>{c.avgSpeedKmh} km/h</span></div></div>
            </div>))}</div>
        )}
      </Card>
    </div>
  );
}

function ManageModal({ studentId, currentStage, onClose, onApplied }: any) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [stage, setStage]         = useState(currentStage);
  const [dietId, setDietId]       = useState<string>("");
  const [routineId, setRoutineId] = useState<string>("");
  const [saving, setSaving]       = useState(false);

  /* ── Macro overrides ── */
  const [protein,   setProtein]   = useState("");
  const [carbs,     setCarbs]     = useState("");
  const [fat,       setFat]       = useState("");
  const [calories,  setCalories]  = useState("");

  /* ── Routine settings ── */
  const [splitBlock,       setSplitBlock]       = useState("");
  const [phaseWeek,        setPhaseWeek]        = useState("");
  const [phaseTotalWeeks,  setPhaseTotalWeeks]  = useState("");
  const [trackRpe,         setTrackRpe]         = useState(false);
  const [weightLimits,     setWeightLimits]     = useState(false);

  useEffect(() => { fetch("/api/templates").then((r) => r.json()).then(setTemplates).catch(() => {}); }, []);
  const diets    = templates.filter((t) => t.type === "diet");
  const routines = templates.filter((t) => t.type === "routine");

  const apply = async () => {
    setSaving(true);
    const macroOverrides = (protein || carbs || fat || calories) ? {
      protein:  protein  ? parseFloat(protein)  : undefined,
      carbs:    carbs    ? parseFloat(carbs)    : undefined,
      fat:      fat      ? parseFloat(fat)      : undefined,
      calories: calories ? parseFloat(calories) : undefined,
    } : undefined;
    const routineSettings = (splitBlock || phaseWeek || phaseTotalWeeks || trackRpe || weightLimits) ? {
      splitBlock:      splitBlock || undefined,
      phaseWeek:       phaseWeek       ? parseInt(phaseWeek)       : undefined,
      phaseTotalWeeks: phaseTotalWeeks ? parseInt(phaseTotalWeeks) : undefined,
      trackRpe,
      weightLimits,
    } : undefined;
    await fetch("/api/students/change-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentIds: [studentId], stage,
        stageNumber: STAGES.indexOf(stage) + 1,
        dietTemplateId:    dietId    || undefined,
        routineTemplateId: routineId || undefined,
        macroOverrides,
        routineSettings,
      }),
    });
    onApplied();
  };

  const sectionLbl = (txt: string) => (
    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2.5" style={{ color: C.secondary }}>{txt}</p>
  );
  const iS = { background: C.raised, border: `1px solid ${C.border}`, color: C.primary } as const;
  const iC = "flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none";
  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl"
      style={{ background: C.raised, border: `1px solid ${C.border}` }}>
      <span className="text-[13px]" style={{ color: C.secondary }}>{label}</span>
      <button onClick={() => onChange(!value)}
        className="w-10 h-5.5 rounded-full relative cursor-pointer transition-colors shrink-0"
        style={{
          background: value ? C.info : "rgba(255,255,255,0.1)",
          width: 38, height: 22,
        }}>
        <span className="absolute top-0.5 rounded-full transition-transform"
          style={{
            width: 18, height: 18, left: 2,
            background: "#fff",
            transform: `translateX(${value ? 16 : 0}px)`,
          }} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.78)" }} />
      <div className="relative w-full max-w-md rounded-2xl z-10 overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-[16px] font-semibold" style={{ color: C.primary }}>Gestionar alumno</h3>
          <button onClick={onClose} className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ background: C.raised }}>
            <X size={14} style={{ color: C.secondary }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto">

          {/* Etapa */}
          <div>
            {sectionLbl("Etapa")}
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button key={s} onClick={() => setStage(s)}
                  className="flex-1 px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-colors"
                  style={{
                    background: stage === s ? "rgba(255,255,255,0.09)" : C.raised,
                    border: `1px solid ${stage === s ? "rgba(255,255,255,0.25)" : C.border}`,
                    color: stage === s ? C.primary : C.secondary,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ── DIETA ── */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <div className="px-4 py-3" style={{ background: C.raised, borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.secondary }}>Dieta</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Template picker */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: C.secondary }}>Plantilla base</p>
                {diets.length === 0 ? (
                  <p className="text-[12px]" style={{ color: C.tertiary }}>No hay plantillas de dieta.</p>
                ) : (
                  <div className="space-y-1.5">
                    {diets.map((t: any) => (
                      <button key={t.id} onClick={() => setDietId(dietId === t.id ? "" : t.id)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors"
                        style={{
                          background: dietId === t.id ? "rgba(96,165,250,0.1)" : C.raised,
                          border: `1px solid ${dietId === t.id ? `${C.info}50` : C.border}`,
                          color: dietId === t.id ? C.info : C.secondary,
                        }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Macro override inputs */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: C.secondary }}>
                  Objetivos macro diarios <span style={{ color: C.tertiary }}>(sobreescribe la plantilla)</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["Proteína (g)",  protein,  setProtein,  "150"],
                    ["Carbos (g)",    carbs,    setCarbs,    "200"],
                    ["Grasa (g)",     fat,      setFat,      "55" ],
                    ["Calorías (kcal)", calories, setCalories, "2000"],
                  ] as [string, string, (v: string) => void, string][]).map(([label, val, setter, ph]) => (
                    <div key={label}>
                      <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: C.tertiary }}>{label}</p>
                      <input value={val} onChange={(e) => setter(e.target.value)}
                        type="number" min="0" placeholder={ph}
                        className={iC} style={iS} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RUTINA ── */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <div className="px-4 py-3" style={{ background: C.raised, borderBottom: `1px solid ${C.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.secondary }}>Rutina</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Template picker */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: C.secondary }}>Plantilla base</p>
                {routines.length === 0 ? (
                  <p className="text-[12px]" style={{ color: C.tertiary }}>No hay plantillas de rutina.</p>
                ) : (
                  <div className="space-y-1.5">
                    {routines.map((t: any) => (
                      <button key={t.id} onClick={() => setRoutineId(routineId === t.id ? "" : t.id)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors"
                        style={{
                          background: routineId === t.id ? "rgba(96,165,250,0.1)" : C.raised,
                          border: `1px solid ${routineId === t.id ? `${C.info}50` : C.border}`,
                          color: routineId === t.id ? C.info : C.secondary,
                        }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Routine settings */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: C.secondary }}>Configuración del bloque</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: C.tertiary }}>Nombre del bloque / split</p>
                    <input value={splitBlock} onChange={(e) => setSplitBlock(e.target.value)}
                      placeholder="Ej. Push / Pull / Legs · Fase fuerza"
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none" style={iS} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: C.tertiary }}>Semana actual</p>
                      <input value={phaseWeek} onChange={(e) => setPhaseWeek(e.target.value)}
                        type="number" min="1" max="52" placeholder="1"
                        className={iC} style={iS} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: C.tertiary }}>Total de semanas</p>
                      <input value={phaseTotalWeeks} onChange={(e) => setPhaseTotalWeeks(e.target.value)}
                        type="number" min="1" max="52" placeholder="4"
                        className={iC} style={iS} />
                    </div>
                  </div>
                  <Toggle label="Registro de RPE" value={trackRpe} onChange={setTrackRpe} />
                  <Toggle label="Límites de peso absoluto" value={weightLimits} onChange={setWeightLimits} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={apply} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-50 transition-opacity"
            style={{ background: C.info, color: "#000" }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : "Aplicar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
