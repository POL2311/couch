"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Flame, Ruler, Droplet, LogOut, Camera, Loader2, CheckCircle2, Download, TrendingDown, Dumbbell, Utensils,
} from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { downloadBadge } from "@/lib/badge";
import type { Student, StudentDetail, RoutineDay } from "@/lib/mock-data";

type Detail = StudentDetail & { height?: number; bodyFat?: number; photoName?: string };

export default function PortalPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setDetail(data.detail);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4 pt-8">
        <Skeleton className="h-10 w-40" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!student || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Tu cuenta aún no tiene una ficha de alumno asociada.
        </p>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-[13px] underline" style={{ color: "var(--text-primary)" }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  const firstName = student.name.split(" ")[0];
  const startWeight = detail.weightHistory[0]?.weight ?? student.currentWeight;
  const diff = student.currentWeight - startWeight;
  const day: RoutineDay | undefined = detail.routine.days[activeDay];

  return (
    <div className="max-w-xl mx-auto px-4 pb-28 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>Hola,</p>
          <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>{firstName}</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className="p-2.5 rounded-xl cursor-pointer"
          style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
        >
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Peso actual" value={`${student.currentWeight}`} unit="kg"
          sub={`${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`} subColor={diff <= 0 ? "var(--color-success)" : "var(--color-info)"} icon={TrendingDown} />
        <StatCard label="Racha" value={`${student.streak}`} unit="días" icon={Flame} />
        <StatCard label="Estatura" value={`${detail.height ?? "—"}`} unit="cm" icon={Ruler} />
        <StatCard label="% Grasa" value={`${detail.bodyFat ?? "—"}`} unit="%" icon={Droplet} />
      </div>

      {/* Descargar insignia */}
      <button
        onClick={() =>
          downloadBadge({
            name: student.name,
            photoUrl: detail.photoName,
            currentWeight: student.currentWeight,
            startWeight,
            streak: student.streak,
            height: detail.height,
            bodyFat: detail.bodyFat,
            stage: `${student.stage} · E${student.stageNumber}`,
            weightHistory: detail.weightHistory,
          })
        }
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[14px] font-medium cursor-pointer mb-6 transition-opacity hover:opacity-85"
        style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
      >
        <Download size={18} strokeWidth={2} /> Descargar Insignia de Progreso
      </button>

      {/* Registro de progreso */}
      <ProgressForm onSaved={fetchMe} />

      {/* Dieta de hoy */}
      <Card title="Tu dieta de hoy" icon={Utensils}>
        {detail.diet.meals.length === 0 ? (
          <Empty text="Tu coach aún no asigna tu dieta." />
        ) : (
          <div className="space-y-2">
            {detail.diet.meals.map((m, i) => (
              <MealCheck key={i} name={m.name} time={m.time} calories={m.calories} items={m.items} />
            ))}
          </div>
        )}
      </Card>

      {/* Rutina */}
      <Card title="Tu rutina" icon={Dumbbell}>
        {detail.routine.days.length === 0 ? (
          <Empty text="Tu coach aún no asigna tu rutina." />
        ) : (
          <>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
              {detail.routine.days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i)}
                  className="px-3.5 py-1.5 rounded-lg text-[12px] whitespace-nowrap cursor-pointer"
                  style={{
                    background: activeDay === i ? "var(--accent-primary)" : "var(--bg-surface-raised)",
                    color: activeDay === i ? "var(--text-inverse)" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    fontWeight: activeDay === i ? 600 : 500,
                  }}
                >
                  {d.day.slice(0, 3)}
                </button>
              ))}
            </div>
            {day && (
              <div>
                <p className="text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>{day.label} · {day.muscleGroup}</p>
                <div className="space-y-1.5">
                  {day.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
                      <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>{ex.name}</span>
                      <span className="text-[12px] tabular-nums" style={{ color: "var(--text-secondary)" }}>{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

/* ── Subcomponentes ── */

function StatCard({ label, value, unit, sub, subColor, icon: Icon }: any) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
        <Icon size={15} strokeWidth={1.75} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <p className="text-[26px] font-light tabular-nums leading-none" style={{ color: "var(--text-primary)" }}>
        {value}<span className="text-[13px] font-normal ml-1" style={{ color: "var(--text-tertiary)" }}>{unit}</span>
      </p>
      {sub && <p className="text-[12px] mt-1 tabular-nums" style={{ color: subColor }}>{sub}</p>}
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} strokeWidth={1.75} style={{ color: "var(--text-secondary)" }} />
        <h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[12px] py-4 text-center" style={{ color: "var(--text-tertiary)" }}>{text}</p>;
}

function MealCheck({ name, time, calories, items }: { name: string; time: string; calories: number; items: string[] }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => setDone((d) => !d)}
      className="w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-colors"
      style={{
        background: done ? "var(--color-success-subtle)" : "var(--bg-surface-raised)",
        border: `1px solid ${done ? "var(--color-success)" : "var(--border-subtle)"}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 size={18} strokeWidth={1.75} style={{ color: done ? "var(--color-success)" : "var(--text-tertiary)" }} />
          <span className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{name}</span>
        </div>
        <span className="text-[11px] tabular-nums shrink-0" style={{ color: "var(--text-tertiary)" }}>{time} · {calories} kcal</span>
      </div>
      <p className="text-[11px] mt-1 ml-7 truncate" style={{ color: "var(--text-secondary)" }}>{items.join(" · ")}</p>
    </button>
  );
}

function ProgressForm({ onSaved }: { onSaved: () => void }) {
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !photo) return;
    setStatus("saving");
    const fd = new FormData();
    if (weight) fd.append("weight", weight);
    if (photo) fd.append("photo", photo);
    const res = await fetch("/api/me", { method: "POST", body: fd });
    if (res.ok) {
      setStatus("saved");
      setWeight("");
      setPhoto(null);
      onSaved();
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl p-5 mb-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <h3 className="text-[14px] font-medium mb-4" style={{ color: "var(--text-primary)" }}>Registrar progreso de hoy</h3>
      <div className="flex flex-col gap-3">
        <input
          type="number" step="0.1" inputMode="decimal" value={weight}
          onChange={(e) => setWeight(e.target.value)} placeholder="Peso de hoy (kg)"
          className="px-3.5 py-2.5 rounded-xl text-[13px] outline-none border focus:border-[var(--border-strong)]"
          style={{ background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
        />
        <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] cursor-pointer"
          style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", color: photo ? "var(--text-primary)" : "var(--text-tertiary)" }}>
          <Camera size={16} strokeWidth={1.75} />
          <span className="truncate">{photo ? photo.name : "Subir foto de progreso"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        </label>
        <button
          type="submit" disabled={status === "saving" || (!weight && !photo)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
        >
          {status === "saving" ? <Loader2 size={16} className="animate-spin" /> : status === "saved" ? <>Guardado <CheckCircle2 size={16} /></> : "Guardar progreso"}
        </button>
      </div>
    </form>
  );
}
