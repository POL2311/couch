"use client";

/* ═══════════════════════════════════════════
   Catálogo de ejercicios (WEB) — paridad con la app:
   crear/editar/borrar + buscar + filtrar por grupo.
   ═══════════════════════════════════════════ */
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Plus, Trash2, Dumbbell, X, Loader2, Upload, Sparkles } from "lucide-react";

const MUSCLE_GROUPS = ["Pecho", "Espalda", "Pierna", "Glúteo", "Hombro", "Brazo", "Core", "Cardio"];
const EQUIPMENT = ["Barra", "Mancuerna", "Polea", "Máquina", "Peso corporal", "Kettlebell", "Banda"];

interface Ejercicio { id: string; name: string; muscleGroup: string; equipment: string; bodyweight: boolean; imageUrl?: string; videoUrl?: string }

export default function ExercisesPage() {
  const [items,   setItems]   = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");
  const [group,   setGroup]   = useState("Todos");
  const [editing, setEditing] = useState<Ejercicio | null | undefined>(undefined);
  const [seeding, setSeeding] = useState(false);
  const [seeded,  setSeeded]  = useState(false);

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

  const seed = async () => {
    setSeeding(true);
    setSeeded(false);
    try {
      await fetch("/api/coach/exercises/seed", { method: "POST" });
      await load();
      setSeeded(true);
      setTimeout(() => setSeeded(false), 3000);
    } finally { setSeeding(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <Link href="/coach/templates" className="inline-flex items-center gap-1.5 text-[13px] mb-5" style={{ color: "var(--text-tertiary)" }}><ChevronLeft size={16} /> Volver a plantillas</Link>

      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: "var(--text-primary)" }}>Catálogo de ejercicios</h1>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>{items.length} ejercicios</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={seed} disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium cursor-pointer disabled:opacity-50 transition-all"
            style={{
              background: seeded ? "rgba(52,211,153,0.12)" : "rgba(167,139,250,0.1)",
              border: `1px solid ${seeded ? "rgba(52,211,153,0.3)" : "rgba(167,139,250,0.25)"}`,
              color: seeded ? "#34d399" : "#a78bfa",
            }}>
            {seeding
              ? <Loader2 size={13} className="animate-spin" />
              : <Sparkles size={13} />}
            {seeding ? "Cargando…" : seeded ? "¡Listo!" : "Cargar catálogo"}
          </button>
          <button onClick={() => setEditing(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer"
            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}>
            <Plus size={16} /> Nuevo
          </button>
        </div>
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
  const [name,       setName]       = useState(initial?.name ?? "");
  const [group,      setGroup]      = useState(initial?.muscleGroup ?? MUSCLE_GROUPS[0]);
  const [equip,      setEquip]      = useState(initial?.equipment || EQUIPMENT[0]);
  const [bodyweight, setBodyweight] = useState(initial?.bodyweight ?? false);
  const [videoUrl,   setVideoUrl]   = useState(initial?.videoUrl ?? "");
  const [imageUrl,   setImageUrl]   = useState(initial?.imageUrl ?? "");
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl || null);
  const [saving, setSaving] = useState(false);

  const pickImage = (file: File) => {
    setImageFile(file);
    setImageUrl("");
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!name.trim()) { alert("Ponle un nombre al ejercicio."); return; }
    setSaving(true);
    try {
      const endpoint = initial ? `/api/ejercicios/${initial.id}` : "/api/ejercicios";
      const method   = initial ? "PUT" : "POST";

      if (imageFile) {
        const fd = new FormData();
        fd.append("name",        name.trim());
        fd.append("muscleGroup", group);
        fd.append("equipment",   bodyweight ? "Peso corporal" : equip);
        fd.append("bodyweight",  String(bodyweight));
        fd.append("videoUrl",    videoUrl);
        fd.append("imageUrl",    imageUrl);
        fd.append("image",       imageFile);
        await fetch(endpoint, { method, body: fd });
      } else {
        await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(), muscleGroup: group,
            equipment: bodyweight ? "Peso corporal" : equip, bodyweight,
            videoUrl: videoUrl || undefined,
            imageUrl: imageUrl || undefined,
          }),
        });
      }
      onSaved();
    } finally { setSaving(false); }
  };

  const V = {
    bg:      "var(--bg-surface)",
    raised:  "var(--bg-surface-raised)",
    border:  "var(--border-subtle)",
    borderS: "var(--border-strong)",
    tp:      "var(--text-primary)",
    ts:      "var(--text-secondary)",
    tt:      "var(--text-tertiary)",
    accent:  "var(--accent-primary)",
    inv:     "var(--text-inverse)",
    info:    "var(--color-info)",
    danger:  "var(--color-danger)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 backdrop-blur-sm" style={{ background: "var(--scrim)" }} />
      <div className="relative w-full max-w-md rounded-2xl z-10 flex flex-col"
        style={{ background: V.bg, border: `1px solid ${V.borderS}`, boxShadow: "0 24px 64px rgba(0,0,0,0.85)", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${V.border}` }}>
          <h3 className="text-[16px] font-semibold" style={{ color: V.tp }}>{initial ? "Editar" : "Nuevo"} ejercicio</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ background: V.raised }}>
            <X size={14} style={{ color: V.ts }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">

          {/* Name */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: V.ts }}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Press de Banca"
              className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none"
              style={{ background: V.raised, border: `1px solid ${V.border}`, color: V.tp }} autoFocus />
          </div>

          {/* Muscle group */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-medium block mb-2" style={{ color: V.ts }}>Grupo muscular</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((g) => (
                <button key={g} onClick={() => setGroup(g)}
                  className="px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer"
                  style={{
                    background: group === g ? "rgba(255,255,255,0.08)" : V.raised,
                    border: `1px solid ${group === g ? V.borderS : V.border}`,
                    color: group === g ? V.tp : V.ts,
                  }}>{g}</button>
              ))}
            </div>
          </div>

          {/* Bodyweight toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[13px] font-medium" style={{ color: V.ts }}>Es de peso corporal</span>
            <input type="checkbox" checked={bodyweight} onChange={(e) => setBodyweight(e.target.checked)} className="w-5 h-5 accent-emerald-400" />
          </label>

          {/* Equipment */}
          {!bodyweight && (
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-2" style={{ color: V.ts }}>Equipo</label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.filter((q) => q !== "Peso corporal").map((q) => (
                  <button key={q} onClick={() => setEquip(q)}
                    className="px-3 py-2 rounded-xl text-[12px] font-medium cursor-pointer"
                    style={{
                      background: equip === q ? "rgba(255,255,255,0.08)" : V.raised,
                      border: `1px solid ${equip === q ? V.borderS : V.border}`,
                      color: equip === q ? V.tp : V.ts,
                    }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Media section ── */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: V.raised, border: `1px solid ${V.border}` }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: V.ts }}>Media del ejercicio</p>

            {/* Video URL */}
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: V.tt }}>Enlace de video (YouTube · Vimeo · MP4)</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-surface)", border: `1px solid ${V.border}`, color: V.tp }} />
            </div>

            {/* Image upload */}
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: V.tt }}>Foto o GIF de referencia</label>

              {/* Drop zone / preview */}
              <label className="block cursor-pointer">
                <div className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all"
                  style={{ background: "var(--bg-surface)", border: `1.5px dashed ${V.border}` }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full max-h-32 object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: V.raised }}>
                        <Upload size={15} style={{ color: V.ts }} />
                      </div>
                      <p className="text-[12px]" style={{ color: V.ts }}>Arrastra o toca para subir imagen/GIF</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImage(f); }} />
              </label>

              {imagePreview && (
                <button onClick={() => { setImageFile(null); setImagePreview(null); setImageUrl(""); }}
                  className="mt-1.5 text-[11px] font-medium cursor-pointer px-2.5 py-1 rounded-lg"
                  style={{ color: V.danger, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  Quitar imagen
                </button>
              )}

              {/* URL fallback */}
              {!imageFile && (
                <input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value || null); }}
                  placeholder="o pega un URL de imagen…"
                  className="mt-2 w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                  style={{ background: "var(--bg-surface)", border: `1px solid ${V.border}`, color: V.tp }} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-4 shrink-0" style={{ borderTop: `1px solid ${V.border}`, background: "#18181b" }}>
          <button onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: V.accent, color: V.inv, height: 44 }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : initial ? "Guardar cambios" : "Crear ejercicio"}
          </button>
        </div>
      </div>
    </div>
  );
}
