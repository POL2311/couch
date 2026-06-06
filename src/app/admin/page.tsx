"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { Users, UserCog, Wallet, Activity, LogOut, Plus, Loader2, X } from "lucide-react";
import { Skeleton } from "@/components/skeleton";

interface CoachRow {
  id: string;
  name: string;
  email: string;
  studentCount: number;
  activeCount: number;
  mrr: number;
}
interface Overview {
  metrics: { totalCoaches: number; totalStudents: number; totalClients: number; activeStudents: number; mrr: number };
  coaches: CoachRow[];
}

const fmtMXN = (n: number) => `$${n.toLocaleString("es-MX")}`;

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>Panel global · SaaS</p>
          <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>Administración</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85"
            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
          >
            <Plus size={16} strokeWidth={2} /> <span className="hidden md:inline">Nuevo coach</span>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Cerrar sesión"
            className="p-2.5 rounded-xl cursor-pointer"
            style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Metric label="MRR Global" value={loading ? null : fmtMXN(data!.metrics.mrr)} icon={Wallet} />
        <Metric label="Coaches" value={loading ? null : String(data!.metrics.totalCoaches)} icon={UserCog} />
        <Metric label="Alumnos" value={loading ? null : String(data!.metrics.totalStudents)} icon={Users} />
        <Metric label="Activos" value={loading ? null : String(data!.metrics.activeStudents)} icon={Activity} />
      </div>

      {/* Coaches table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>Coaches del SaaS</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : (
          <div>
            {data!.coaches.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>{c.email}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <Stat label="Alumnos" value={String(c.studentCount)} />
                  <Stat label="Activos" value={String(c.activeCount)} />
                  <Stat label="MRR" value={fmtMXN(c.mrr)} />
                </div>
              </div>
            ))}
            {data!.coaches.length === 0 && (
              <p className="text-[12px] py-8 text-center" style={{ color: "var(--text-tertiary)" }}>Aún no hay coaches registrados.</p>
            )}
          </div>
        )}
      </div>

      {modalOpen && <NewCoachModal onClose={() => setModalOpen(false)} onCreated={() => { setModalOpen(false); fetchData(); }} />}
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | null; icon: any }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
        <Icon size={16} strokeWidth={1.75} style={{ color: "var(--text-tertiary)" }} />
      </div>
      {value === null ? <Skeleton className="h-7 w-20" /> : (
        <p className="text-[24px] font-light tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-[14px] font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{label}</p>
    </div>
  );
}

function NewCoachModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      onCreated();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "No se pudo crear la cuenta.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl p-6 z-10 animate-fade-in space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>Nuevo coach</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg cursor-pointer" style={{ color: "var(--text-tertiary)" }}><X size={18} /></button>
        </div>
        {[["Nombre", name, setName, "text"], ["Correo", email, setEmail, "email"], ["Contraseña", password, setPassword, "password"]].map(([label, val, set, type]: any) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
            <input type={type} required value={val} onChange={(e) => set(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl text-[13px] outline-none border focus:border-[var(--border-strong)]"
              style={{ background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }} />
          </div>
        ))}
        {error && <p className="text-[12px] px-3 py-2 rounded-xl" style={{ background: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>{error}</p>}
        <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : "Crear cuenta de coach"}
        </button>
      </form>
    </div>
  );
}
