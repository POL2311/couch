"use client";

import { useState, useEffect } from "react";
import { type Stage } from "@/lib/mock-data";
import { DIET_TEMPLATES, ROUTINE_TEMPLATES } from "@/lib/templates";

interface ChangeStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentIds: string[];
  onSuccess: () => void;
}

export default function ChangeStageModal({ isOpen, onClose, studentIds, onSuccess }: ChangeStageModalProps) {
  const [stage, setStage] = useState<Stage>("Volumen");
  const [stageNumber, setStageNumber] = useState(1);
  const [dietTemplateId, setDietTemplateId] = useState("");
  const [routineTemplateId, setRoutineTemplateId] = useState("");
  const [timing, setTiming] = useState<"immediate" | "scheduled">("immediate");
  
  // Set default scheduled date to 15 days in the future or the 15th of the month
  const [executionDate, setExecutionDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize date with today + 10 days
      const date = new Date();
      date.setDate(date.getDate() + 10);
      setExecutionDate(date.toISOString().split("T")[0]);
      
      // Reset defaults
      setStage("Volumen");
      setStageNumber(1);
      setDietTemplateId("");
      setRoutineTemplateId("");
      setTiming("immediate");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/students/change-stage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentIds,
          stage,
          stageNumber,
          dietTemplateId: dietTemplateId || undefined,
          routineTemplateId: routineTemplateId || undefined,
          executionDate: timing === "scheduled" ? executionDate : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar el cambio de etapa");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl z-10 animate-fade-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
        }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>
            {studentIds.length > 1
              ? `Cambiar Etapa de Alumnos (${studentIds.length})`
              : "Cambiar Etapa del Alumno"}
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Define los nuevos objetivos, planes de dieta/rutina y cuándo ejecutarlos.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderBottom: "1px solid var(--border-subtle)" }} />

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Etapa y Número */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                Nueva Etapa
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
                className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] cursor-pointer transition-all duration-150"
                style={{
                  background: "var(--bg-surface-raised)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="Volumen">Volumen</option>
                <option value="Definición">Definición</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Recomposición">Recomposición</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                Número de Etapa
              </label>
              <input
                type="number"
                min="1"
                required
                value={stageNumber}
                onChange={(e) => setStageNumber(parseInt(e.target.value) || 1)}
                className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                style={{
                  background: "var(--bg-surface-raised)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Plantilla de Dieta */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
              Asignar Plantilla de Dieta (Opcional)
            </label>
            <select
              value={dietTemplateId}
              onChange={(e) => setDietTemplateId(e.target.value)}
              className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] cursor-pointer transition-all duration-150"
              style={{
                background: "var(--bg-surface-raised)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Mantener dieta actual o sin cambios</option>
              {DIET_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.totalCalories} kcal)
                </option>
              ))}
            </select>
          </div>

          {/* Plantilla de Rutina */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
              Asignar Plantilla de Rutina (Opcional)
            </label>
            <select
              value={routineTemplateId}
              onChange={(e) => setRoutineTemplateId(e.target.value)}
              className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] cursor-pointer transition-all duration-150"
              style={{
                background: "var(--bg-surface-raised)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Mantener rutina actual o sin cambios</option>
              {ROUTINE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.daysPerWeek} días/sem)
                </option>
              ))}
            </select>
          </div>

          {/* Cuándo Aplicar (Ejecución) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
              Fecha de Ejecución
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <label
                className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-150"
                style={{
                  background: timing === "immediate" ? "var(--bg-surface-overlay)" : "var(--bg-surface-raised)",
                  borderColor: timing === "immediate" ? "var(--text-primary)" : "var(--border-subtle)",
                }}
                onClick={() => setTiming("immediate")}
              >
                <input
                  type="radio"
                  name="timing"
                  checked={timing === "immediate"}
                  onChange={() => setTiming("immediate")}
                  className="accent-zinc-900"
                />
                <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>Inmediato</span>
              </label>

              <label
                className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-150"
                style={{
                  background: timing === "scheduled" ? "var(--bg-surface-overlay)" : "var(--bg-surface-raised)",
                  borderColor: timing === "scheduled" ? "var(--text-primary)" : "var(--border-subtle)",
                }}
                onClick={() => setTiming("scheduled")}
              >
                <input
                  type="radio"
                  name="timing"
                  checked={timing === "scheduled"}
                  onChange={() => setTiming("scheduled")}
                  className="accent-zinc-900"
                />
                <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>Programar</span>
              </label>
            </div>

            {/* Date input shown if scheduled */}
            {timing === "scheduled" && (
              <input
                type="date"
                required
                value={executionDate}
                onChange={(e) => setExecutionDate(e.target.value)}
                className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150 animate-fade-in"
                style={{
                  background: "var(--bg-surface-raised)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150 disabled:opacity-50"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.borderColor = "var(--border-default)";
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150 disabled:opacity-50"
              style={{
                background: "var(--accent-primary)",
                color: "var(--text-inverse)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {isSubmitting
                ? "Guardando..."
                : timing === "scheduled"
                ? "Programar Cambio"
                : "Aplicar Cambio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
