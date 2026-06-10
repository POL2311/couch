"use client";

/* ═══════════════════════════════════════════
   Catálogo de ejercicios (WEB) — paridad con la app:
   crear/editar/borrar + buscar + filtrar por grupo.
   ═══════════════════════════════════════════ */
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Plus, Trash2, Dumbbell, X, Loader2 } from "lucide-react";

const MUSCLE_GROUPS = ["Pecho", "Espalda", "Pierna", "Glúteo", "Hombro", "Brazo", "Core", "Cardio"];
const EQUIPMENT = ["Barra", "Mancuerna", "Polea", "Máquina", "Peso corporal", "Kettlebell", "Banda"];

interface Ejercicio { id: string; name: string; muscleGroup: string; equipment: string; bodyweight: boolean }

export default function ExercisesPage() {
  const [items, setItems] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [editing, setEditing] = useState<Ejercicio | null | undefined>(undefined); // undefined=cerrado, null=nuevo

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/ejercicios"); setItems(await r.json()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => items.filter((e) => (group === "Todos" || e.muscleGroup === group) && e.name.toLowerCase().includes(query.toLowerCase())), [items, query, group]);

  const remove = async (e: Ejercicio) => {
    if (!confirm(`¿Eliminar "${e.name}"?`)) return;
    await fetch(`/api/ejercicios/${e.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <Link href="/coach/templates" className="inline-flex items-center gap-1.5 text-[13px] mb-5" style={{ color: "var(--text-tertiary)" }}><ChevronLeft size={16} /> Volver a plantillas</Link>

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: "var(--text-primary)" }}>Catálogo de ejercicios</h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>{items.length} ejercicios</p>
        </div>
        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}><Plus size={16} /> Nuevo</button>
      </div>

      <div className="flex items-center px-3.5 rounded-xl mb-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <Search size={15} style={{ color: "var(--text-tertiary)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar ejercicio…" className="flex-1 py-2.5 px-2 text-[14px] bg-transparent outline-none" style={{ color: "var(--text-primary)" }} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
        {["Todos", ...MUSCLE_GROUPS].map((g) => {
          const active = group === g;
          return <button key={g} onClick={() => setGroup(g)} className="px-3.5 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap cursor-pointer" style={{ background: active ? "var(--text-primary)" : "var(--bg-surface)", border: `1px solid ${active ? "var(--text-primary)" : "var(--border-subtle)"}`, color: active ? "var(--text-inverse)" : "var(--text-secondary)" }}>{g}</button>;
        })}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--text-primary)" }} /></div> : (
        <div className="space-y-2.5">
          {list.length === 0 ? (
            <div className="flex flex-col items-center py-16"><Dumbbell size={32} style={{ color: "var(--text-tertiary)" }} /><p className="text-[13px] mt-3" style={{ color: "var(--text-tertiary)" }}>{items.length === 0 ? "Aún no tienes ejercicios. Crea el primero." : "Sin resultados"}</p></div>
          ) : list.map((e) => (
            <div key={e.id} className="flex items-center p-4 rounded-2xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--bg-surface-raised)" }}><Dumbbell size={18} style={{ color: "var(--text-secondary)" }} /></div>
              <button onClick={() => setEditing(e)} className="flex-1 ml-3 text-left cursor-pointer">
                <p className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>{e.name}</p>
                <div className="flex items-center gap-2 mt-1 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  <span className="px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }}>{e.muscleGroup}</span>
                  {e.equipment && <span>{e.equipment}</span>}
                  {e.bodyweight && <span style={{ color: "var(--color-info)" }}>· peso corporal</span>}
                </div>
              </button>
              <button onClick={() => remove(e)} className="cursor-pointer p-1.5"><Trash2 size={16} style={{ color: "var(--color-danger)" }} /></button>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && <EditorModal initial={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />}
    </div>
  );
}

function EditorModal({ initial, onClose, onSaved }: { initial: Ejercicio | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [group, setGroup] = useState(initial?.muscleGroup ?? MUSCLE_GROUPS[0]);
  const [equip, setEquip] = useState(initial?.equipment || EQUIPMENT[0]);
  const [bodyweight, setBodyweight] = useState(initial?.bodyweight ?? false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { alert("Ponle un nombre al ejercicio."); return; }
    setSaving(true);
    const data = { name: name.trim(), muscleGroup: group, equipment: bodyweight ? "Peso corporal" : equip, bodyweight };
    if (initial) await fetch(`/api/ejercicios/${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    else await fetch("/api/ejercicios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} />
      <div className="relative w-full max-w-md rounded-2xl p-6 z-10 space-y-4 max-h-[85vh] overflow-y-auto" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-[16px] font-medium" style={{ color: "var(--text-primary)" }}>{initial ? "Editar" : "Nuevo"} ejercicio</h3><button onClick={onClose} className="cursor-pointer"><X size={18} style={{ color: "var(--text-tertiary)" }} /></button></div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Press de Banca" className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }} />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Grupo muscular</label>
          <div className="flex flex-wrap gap-2">{MUSCLE_GROUPS.map((g) => <button key={g} onClick={() => setGroup(g)} className="px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer" style={{ background: group === g ? "rgba(255,255,255,0.08)" : "var(--bg-surface-raised)", border: `1px solid ${group === g ? "var(--border-strong)" : "var(--border-subtle)"}`, color: group === g ? "var(--text-primary)" : "var(--text-secondary)" }}>{g}</button>)}</div>
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>Es de peso corporal</span>
          <input type="checkbox" checked={bodyweight} onChange={(e) => setBodyweight(e.target.checked)} className="w-5 h-5 accent-emerald-400" />
        </label>

        {!bodyweight && (
          <div>
            <label className="text-[10px] uppercase tracking-wider font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>Equipo</label>
            <div className="flex flex-wrap gap-2">{EQUIPMENT.filter((q) => q !== "Peso corporal").map((q) => <button key={q} onClick={() => setEquip(q)} className="px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer" style={{ background: equip === q ? "rgba(255,255,255,0.08)" : "var(--bg-surface-raised)", border: `1px solid ${equip === q ? "var(--border-strong)" : "var(--border-subtle)"}`, color: equip === q ? "var(--text-primary)" : "var(--text-secondary)" }}>{q}</button>)}</div>
          </div>
        )}

        <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer" style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}>{saving ? <Loader2 size={16} className="animate-spin" /> : initial ? "Guardar cambios" : "Crear ejercicio"}</button>
      </div>
    </div>
  );
}
