"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ChevronLeft } from "lucide-react";

// ── Extended state machine ──────────────────────────────────────────────────
type OnboardingStep =
  | "WELCOME"
  | "CALIBRATE_MISSION"
  | "CALIBRATE_CHASSIS"
  | "CALIBRATE_ACTIVITY"
  | "AUTH_TERMINAL";

type Mission       = "GRASA" | "MUSCULO" | "RENDIMIENTO" | "RECOMPOSICION" | null;
type ActivityLevel = "SEDENTARIO" | "LIGERO" | "MODERADO" | "INTENSO" | "ELITE" | null;

// ── Static data tables ──────────────────────────────────────────────────────
const MISSIONS: { id: NonNullable<Mission>; icon: string; title: string; desc: string }[] = [
  { id: "GRASA",        icon: "⚡", title: "QUEMAR GRASA",      desc: "Definición corporal · Reducción de grasa · Corte metabólico" },
  { id: "MUSCULO",      icon: "◈", title: "CONSTRUIR MÚSCULO",  desc: "Hipertrofia táctica · Fuerza máxima · Volumen progresivo" },
  { id: "RENDIMIENTO",  icon: "◆", title: "RENDIMIENTO",        desc: "Velocidad · Resistencia cardio · Capacidad atlética élite" },
  { id: "RECOMPOSICION",icon: "★", title: "RECOMPOSICIÓN",      desc: "Transformación corporal total · Grasa ↓ Músculo ↑ simultáneo" },
];

const ACTIVITIES: { id: NonNullable<ActivityLevel>; label: string; freq: string; mult: number }[] = [
  { id: "SEDENTARIO", label: "SEDENTARIO",    freq: "Sin ejercicio regular",          mult: 1.2  },
  { id: "LIGERO",     label: "LIGERO",        freq: "1–2 entrenamientos / semana",    mult: 1.375 },
  { id: "MODERADO",   label: "MODERADO",      freq: "3–4 entrenamientos / semana",    mult: 1.55  },
  { id: "INTENSO",    label: "INTENSO",       freq: "5–6 entrenamientos / semana",    mult: 1.725 },
  { id: "ELITE",      label: "ATLETA ÉLITE",  freq: "Doble sesión diaria + competición", mult: 1.9 },
];

const DEMO_ACCOUNTS = [
  { role: "CLIENTE", email: "cliente@mycoach.app", password: "cliente123" },
  { role: "COACH",   email: "coach@mycoach.app",   password: "coach123"   },
  { role: "ADMIN",   email: "admin@mycoach.app",   password: "admin123"   },
];

const STEP_ORDER: OnboardingStep[] = [
  "WELCOME", "CALIBRATE_MISSION", "CALIBRATE_CHASSIS", "CALIBRATE_ACTIVITY", "AUTH_TERMINAL",
];
const STEP_NUM: Record<OnboardingStep, number> = {
  WELCOME: 0, CALIBRATE_MISSION: 1, CALIBRATE_CHASSIS: 2, CALIBRATE_ACTIVITY: 3, AUTH_TERMINAL: 4,
};

// ── Shared style tokens ─────────────────────────────────────────────────────
const DS   = "var(--font-display,'Barlow Condensed',sans-serif)";
const MONO = "'Courier New', monospace";

// ── Shared chrome fragments ─────────────────────────────────────────────────
function GridBg() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(rgba(206,255,0,0.025) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(206,255,0,0.025) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)",
      }} />
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function LandingGateway() {
  const router = useRouter();

  // Onboarding state
  const [step,     setStep]     = useState<OnboardingStep>("WELCOME");
  const [mission,  setMission]  = useState<Mission>(null);
  const [age,      setAge]      = useState("");
  const [weight,   setWeight]   = useState("");
  const [height,   setHeight]   = useState("");
  const [activity, setActivity] = useState<ActivityLevel>(null);
  const [chassisError, setChassisError] = useState<string | null>(null);

  // Auth state
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [authError,setAuthError]= useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  // Derived biometrics
  const bmi = weight && height
    ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
    : null;
  const bmrBase = age && weight && height
    ? Math.round(10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5)
    : null;
  const tdee = bmrBase && activity
    ? Math.round(bmrBase * (ACTIVITIES.find(a => a.id === activity)?.mult ?? 1.55))
    : null;

  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  function advanceTo(next: OnboardingStep) {
    setChassisError(null);
    setAuthError(null);
    setStep(next);
  }

  function validateChassis(): boolean {
    const a = Number(age), w = Number(weight), h = Number(height);
    if (!age || !weight || !height) { setChassisError("COMPLETA TODOS LOS CAMPOS"); return false; }
    if (a < 14 || a > 80)          { setChassisError("EDAD FUERA DE RANGO VÁLIDO (14–80)"); return false; }
    if (w < 30 || w > 300)         { setChassisError("PESO FUERA DE RANGO VÁLIDO (30–300 KG)"); return false; }
    if (h < 100 || h > 250)        { setChassisError("ALTURA FUERA DE RANGO VÁLIDO (100–250 CM)"); return false; }
    return true;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setAuthError("CREDENCIALES INCORRECTAS — ACCESO DENEGADO");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setAuthError("ERROR DE SISTEMA — REINTENTE");
      setLoading(false);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STEP: WELCOME
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === "WELCOME") {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col items-center justify-between p-6 relative overflow-hidden">
        <GridBg />

        <p className="font-mono text-[10px] tracking-[0.4em] text-zinc-600 uppercase self-start relative z-10">
          MC_SYS // V.2026 // FELLS TEAM
        </p>

        <div className="flex flex-col items-center relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: "rgba(206,255,0,0.2)" }} />
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.3em", color: "#3f3f46" }}>
              SISTEMA OPERATIVO ACTIVO
            </span>
            <div className="h-px w-12" style={{ background: "rgba(206,255,0,0.2)" }} />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] text-center"
            style={{ fontFamily: DS }}>
            ⚡ MYCOACH
          </h1>
          <p className="text-xs font-mono font-bold tracking-widest text-lime-400 uppercase text-center mt-2 max-w-sm">
            TACTICAL BODY HARDENING // ZERO MARGIN OF ERROR
          </p>

          <div className="mt-10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.22em", color: "#52525b" }}>
              AWAITING OPERATOR INPUT
            </span>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <button
            onClick={() => advanceTo("CALIBRATE_MISSION")}
            className="w-full bg-lime-400 hover:bg-lime-300 text-black font-mono text-sm font-black tracking-widest py-4 text-center rounded-sm transition-all uppercase shadow-[0_0_20px_rgba(163,230,53,0.2)] cursor-pointer active:scale-[0.98]">
            [ ⚡ INICIAR CALIBRACIÓN ]
          </button>
          <button
            onClick={() => advanceTo("AUTH_TERMINAL")}
            className="w-full mt-3 text-zinc-600 hover:text-zinc-400 font-mono text-[10px] tracking-[0.2em] uppercase text-center transition-all cursor-pointer">
            YA TENGO CUENTA — ACCESO DIRECTO ➔
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SHARED CHROME: calibration steps wrapper
  ══════════════════════════════════════════════════════════════════════════ */
  const stepNum = STEP_NUM[step];

  const StepChrome = ({ children, cta }: { children: React.ReactNode; cta: React.ReactNode }) => (
    <div className="w-full min-h-screen bg-black flex flex-col p-6 relative overflow-hidden">
      <GridBg />

      {/* Step header */}
      <div className="w-full max-w-md mx-auto relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goBack}
            className="flex items-center gap-1 text-zinc-600 hover:text-zinc-400 font-mono text-[10px] tracking-widest uppercase transition-all cursor-pointer">
            <ChevronLeft size={12} />
            PASO {stepNum}/4
          </button>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.3em", color: "#3f3f46" }}>
            ⚡ MYCOACH
          </span>
        </div>
        {/* Progress rails */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
              n <= stepNum ? "bg-lime-400" : "bg-zinc-800"
            }`} />
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto relative z-10">
        {children}
      </div>

      {/* Fixed bottom CTA */}
      <div className="w-full max-w-md mx-auto flex-shrink-0 relative z-10 pt-4">
        {cta}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 1: CALIBRATE_MISSION — Goal Selection
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === "CALIBRATE_MISSION") {
    return (
      <StepChrome cta={
        <button
          onClick={() => mission && advanceTo("CALIBRATE_CHASSIS")}
          disabled={!mission}
          className="w-full bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-mono text-sm font-black tracking-widest py-4 rounded-sm transition-all uppercase cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]">
          {mission ? "CONFIRMAR MISIÓN →" : "SELECCIONA UNA MISIÓN"}
        </button>
      }>
        <div>
          <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", color: "#3f3f46", marginBottom: 4 }}>
            MÓDULO 01 // OBJETIVO OPERACIONAL
          </p>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1"
            style={{ fontFamily: DS }}>
            MISIÓN TÁCTICA
          </h2>
          <p className="font-mono text-[10px] text-zinc-500 tracking-widest mb-6">
            DEFINE TU PROTOCOLO DE TRANSFORMACIÓN
          </p>

          <div className="flex flex-col gap-3">
            {MISSIONS.map(m => {
              const selected = mission === m.id;
              return (
                <button key={m.id} type="button"
                  onClick={() => setMission(m.id)}
                  className={`w-full p-4 flex items-center gap-4 rounded-sm border transition-all cursor-pointer text-left ${
                    selected
                      ? "bg-lime-400/5 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.08)]"
                      : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                  }`}>
                  <span className="text-xl flex-shrink-0" style={{ color: selected ? "#CEFF00" : "#52525b" }}>
                    {m.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black italic uppercase tracking-tight leading-none mb-1"
                      style={{ fontFamily: DS, color: selected ? "#fff" : "rgba(255,255,255,0.6)" }}>
                      {m.title}
                    </p>
                    <p className="font-mono text-[9px] leading-relaxed" style={{ color: "#52525b" }}>
                      {m.desc}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                    selected ? "bg-lime-400 border-lime-400" : "border-zinc-700"
                  }`}>
                    {selected && <span className="text-black font-black" style={{ fontSize: 9 }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </StepChrome>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 2: CALIBRATE_CHASSIS — Age / Weight / Height
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === "CALIBRATE_CHASSIS") {
    return (
      <StepChrome cta={
        <div className="flex flex-col gap-2">
          {chassisError && (
            <p className="font-mono text-[9px] text-red-500 tracking-wider text-center">⚠ {chassisError}</p>
          )}
          <button
            onClick={() => { if (validateChassis()) advanceTo("CALIBRATE_ACTIVITY"); }}
            className="w-full bg-lime-400 hover:bg-lime-300 text-black font-mono text-sm font-black tracking-widest py-4 rounded-sm transition-all uppercase cursor-pointer active:scale-[0.98]">
            CALIBRAR CHASIS →
          </button>
        </div>
      }>
        <div>
          <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", color: "#3f3f46", marginBottom: 4 }}>
            MÓDULO 02 // PARÁMETROS BIOMÉTRICOS
          </p>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1"
            style={{ fontFamily: DS }}>
            DATOS DEL CHASIS
          </h2>
          <p className="font-mono text-[10px] text-zinc-500 tracking-widest mb-6">
            CALIBRACIÓN FÍSICA // MEDIDAS CORPORALES
          </p>

          <div className="flex flex-col gap-3 mb-6">
            {/* Age */}
            <div>
              <p className="font-mono text-[8px] text-zinc-600 tracking-[0.25em] uppercase mb-1.5">EDAD (AÑOS)</p>
              <input
                type="number" inputMode="numeric" min={14} max={80} placeholder="25"
                value={age} onChange={e => { setAge(e.target.value); setChassisError(null); }}
                className="w-full bg-black border border-zinc-800 focus:border-lime-400 text-white font-mono text-sm p-3.5 outline-none rounded-sm transition-colors placeholder:text-zinc-700"
              />
            </div>
            {/* Weight */}
            <div>
              <p className="font-mono text-[8px] text-zinc-600 tracking-[0.25em] uppercase mb-1.5">PESO CORPORAL (KG)</p>
              <input
                type="number" inputMode="decimal" min={30} max={300} step="0.1" placeholder="75"
                value={weight} onChange={e => { setWeight(e.target.value); setChassisError(null); }}
                className="w-full bg-black border border-zinc-800 focus:border-lime-400 text-white font-mono text-sm p-3.5 outline-none rounded-sm transition-colors placeholder:text-zinc-700"
              />
            </div>
            {/* Height */}
            <div>
              <p className="font-mono text-[8px] text-zinc-600 tracking-[0.25em] uppercase mb-1.5">ESTATURA (CM)</p>
              <input
                type="number" inputMode="numeric" min={100} max={250} placeholder="178"
                value={height} onChange={e => { setHeight(e.target.value); setChassisError(null); }}
                className="w-full bg-black border border-zinc-800 focus:border-lime-400 text-white font-mono text-sm p-3.5 outline-none rounded-sm transition-colors placeholder:text-zinc-700"
              />
            </div>
          </div>

          {/* Live biometric readout */}
          {bmi && (
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-sm">
              <p className="font-mono text-[8px] text-zinc-600 tracking-[0.25em] uppercase mb-3">
                // ANÁLISIS PRELIMINAR
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest mb-0.5">IMC</p>
                  <p className="font-mono font-black text-lg" style={{
                    color: Number(bmi) < 18.5 ? "#60a5fa"
                      : Number(bmi) < 25 ? "#CEFF00"
                      : Number(bmi) < 30 ? "#f59e0b"
                      : "#ef4444",
                  }}>{bmi}</p>
                  <p className="font-mono text-[8px] text-zinc-600">
                    {Number(bmi) < 18.5 ? "BAJO PESO"
                      : Number(bmi) < 25 ? "RANGO ÓPTIMO"
                      : Number(bmi) < 30 ? "SOBREPESO"
                      : "OBESIDAD"}
                  </p>
                </div>
                {bmrBase && (
                  <div>
                    <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest mb-0.5">TMB</p>
                    <p className="font-mono font-black text-lg text-zinc-300">{bmrBase}</p>
                    <p className="font-mono text-[8px] text-zinc-600">KCAL BASE / DÍA</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </StepChrome>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 3: CALIBRATE_ACTIVITY — Weekly Activity Level
  ══════════════════════════════════════════════════════════════════════════ */
  if (step === "CALIBRATE_ACTIVITY") {
    return (
      <StepChrome cta={
        <button
          onClick={() => activity && advanceTo("AUTH_TERMINAL")}
          disabled={!activity}
          className="w-full bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-mono text-sm font-black tracking-widest py-4 rounded-sm transition-all uppercase cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]">
          {activity ? "ACTIVAR PERFIL →" : "SELECCIONA TU NIVEL"}
        </button>
      }>
        <div>
          <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", color: "#3f3f46", marginBottom: 4 }}>
            MÓDULO 03 // FRECUENCIA DE ENTRENAMIENTO
          </p>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1"
            style={{ fontFamily: DS }}>
            NIVEL DE ACTIVIDAD
          </h2>
          <p className="font-mono text-[10px] text-zinc-500 tracking-widest mb-6">
            SELECCIONA TU RÉGIMEN SEMANAL ACTUAL
          </p>

          <div className="flex flex-col gap-2.5">
            {ACTIVITIES.map(a => {
              const selected = activity === a.id;
              const tdeePreview = bmrBase ? Math.round(bmrBase * a.mult) : null;
              return (
                <button key={a.id} type="button"
                  onClick={() => setActivity(a.id)}
                  className={`w-full p-4 flex items-center justify-between rounded-sm border transition-all cursor-pointer text-left ${
                    selected
                      ? "bg-lime-400/5 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.08)]"
                      : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                  }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black italic uppercase tracking-tight leading-none mb-0.5"
                      style={{ fontFamily: DS, color: selected ? "#CEFF00" : "rgba(255,255,255,0.7)" }}>
                      {a.label}
                    </p>
                    <p className="font-mono text-[9px]" style={{ color: "#52525b" }}>{a.freq}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {tdeePreview && (
                      <p className="font-mono text-[9px] text-right" style={{ color: selected ? "#a3e635" : "#3f3f46" }}>
                        {tdeePreview}<br/>
                        <span style={{ fontSize: 7, letterSpacing: "0.1em" }}>KCAL/DÍA</span>
                      </p>
                    )}
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                      selected ? "bg-lime-400 border-lime-400" : "border-zinc-700"
                    }`}>
                      {selected && <span className="text-black font-black" style={{ fontSize: 9 }}>✓</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </StepChrome>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STEP 4: AUTH_TERMINAL — Biometric Summary + Login
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <StepChrome cta={
      <button
        form="auth-form"
        type="submit"
        disabled={loading}
        className="w-full bg-lime-400 hover:bg-lime-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-mono text-sm font-black tracking-widest py-4 rounded-sm transition-all uppercase cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> VERIFICANDO...</>
          : "[ 🔓 DESTRABAR SESIÓN ]"}
      </button>
    }>
      <div>
        <p style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.25em", color: "#3f3f46", marginBottom: 4 }}>
          MÓDULO 04 // TERMINAL DE AUTENTICACIÓN
        </p>
        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1"
          style={{ fontFamily: DS }}>
          ACCESO AL SISTEMA
        </h2>
        <p className="font-mono text-[10px] text-zinc-500 tracking-widest mb-5">
          AUTENTICACIÓN REQUERIDA // CERTIFICADO MYCOACH
        </p>

        {/* Biometric summary readout */}
        {(mission || age || activity) && (
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-sm mb-5">
            <p className="font-mono text-[8px] text-zinc-600 tracking-[0.25em] uppercase mb-3">
              // PERFIL BIOMÉTRICO CAPTURADO
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {mission && (
                <div>
                  <p className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest">MISIÓN</p>
                  <p className="font-mono text-[10px] font-black text-lime-400">
                    {MISSIONS.find(m => m.id === mission)?.title ?? mission}
                  </p>
                </div>
              )}
              {activity && (
                <div>
                  <p className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest">ACTIVIDAD</p>
                  <p className="font-mono text-[10px] font-black text-zinc-300">
                    {ACTIVITIES.find(a => a.id === activity)?.label ?? activity}
                  </p>
                </div>
              )}
              {age && (
                <div>
                  <p className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest">EDAD</p>
                  <p className="font-mono text-[10px] font-black text-zinc-300">{age} AÑOS</p>
                </div>
              )}
              {weight && height && bmi && (
                <div>
                  <p className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest">IMC</p>
                  <p className="font-mono text-[10px] font-black" style={{
                    color: Number(bmi) < 18.5 ? "#60a5fa" : Number(bmi) < 25 ? "#CEFF00" : Number(bmi) < 30 ? "#f59e0b" : "#ef4444",
                  }}>{bmi}</p>
                </div>
              )}
              {tdee && (
                <div className="col-span-2">
                  <p className="font-mono text-[7px] text-zinc-600 uppercase tracking-widest">GASTO CALÓRICO ESTIMADO</p>
                  <p className="font-mono text-[10px] font-black text-zinc-300">{tdee} KCAL / DÍA</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auth form */}
        <form id="auth-form" onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email" placeholder="CORREO OPERADOR"
            value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-black border border-zinc-800 focus:border-lime-400 text-white font-mono text-xs p-3.5 outline-none rounded-sm transition-colors placeholder:text-zinc-700"
          />
          <input
            type="password" placeholder="CÓDIGO DE ACCESO"
            value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-black border border-zinc-800 focus:border-lime-400 text-white font-mono text-xs p-3.5 outline-none rounded-sm transition-colors placeholder:text-zinc-700"
          />
          {authError && (
            <p className="font-mono text-[9px] text-red-500 tracking-wider text-center">⚠ {authError}</p>
          )}
        </form>

        {/* Demo accounts strip */}
        <div className="mt-5">
          <p className="font-mono text-[8px] tracking-[0.25em] text-zinc-700 uppercase text-center mb-2">
            // ACCESO RÁPIDO — CUENTAS DE DEMO
          </p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role} type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.password); setAuthError(null); }}
                className="flex-1 bg-zinc-950 border border-zinc-800/60 hover:border-zinc-700 text-zinc-600 hover:text-zinc-400 font-mono text-[9px] font-black tracking-widest uppercase py-2 rounded-sm transition-all cursor-pointer">
                {acc.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepChrome>
  );
}
