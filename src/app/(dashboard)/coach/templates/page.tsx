"use client";

import { useState } from "react";
import { DIET_TEMPLATES, ROUTINE_TEMPLATES } from "@/lib/templates";

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"diets" | "routines">("diets");

  return (
    <>
      {/* Header */}
      <header
        className="px-4 lg:px-8 py-5 flex flex-col gap-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Plantillas Predeterminadas
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Revisa y edita los planes globales de nutrición y entrenamiento para tus alumnos.
            </p>
          </div>
          
          <button
            onClick={() => alert("Crear nueva plantilla [Esta funcionalidad requiere base de datos de plantillas dinámicas]")}
            className="px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer"
            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Nueva Plantilla
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveTab("diets")}
            className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: activeTab === "diets" ? "var(--accent-primary)" : "var(--bg-surface-raised)",
              color: activeTab === "diets" ? "var(--text-inverse)" : "var(--text-secondary)",
              border: activeTab === "diets" ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
            }}
          >
            Planes de Alimentación
          </button>

          <button
            onClick={() => setActiveTab("routines")}
            className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: activeTab === "routines" ? "var(--accent-primary)" : "var(--bg-surface-raised)",
              color: activeTab === "routines" ? "var(--text-inverse)" : "var(--text-secondary)",
              border: activeTab === "routines" ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
            }}
          >
            Planes de Entrenamiento
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto pb-24 lg:pb-8">
        
        {/* Diet Templates */}
        {activeTab === "diets" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
            {DIET_TEMPLATES.map((diet) => (
              <div
                key={diet.id}
                className="rounded-xl border overflow-hidden flex flex-col"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-raised)]">
                  <h3 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{diet.name}</h3>
                  <span className="text-[11px] font-semibold tabular-nums text-zinc-600 bg-white border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full">
                    🔥 {diet.totalCalories} kcal
                  </span>
                </div>

                {/* Macros split bar */}
                <div className="px-5 pt-4">
                  <div className="flex justify-between text-[11px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    <span>P: {diet.macros.protein}g</span>
                    <span>C: {diet.macros.carbs}g</span>
                    <span>G: {diet.macros.fat}g</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--bg-surface-overlay)" }}>
                    {/* Protein bar */}
                    <div style={{ width: `${(diet.macros.protein * 4 / diet.totalCalories) * 100}%`, background: "var(--color-success)" }} title="Proteína" />
                    {/* Carbs bar */}
                    <div style={{ width: `${(diet.macros.carbs * 4 / diet.totalCalories) * 100}%`, background: "var(--color-info)" }} title="Carbos" />
                    {/* Fat bar */}
                    <div style={{ width: `${(diet.macros.fat * 9 / diet.totalCalories) * 100}%`, background: "var(--color-warning)" }} title="Grasa" />
                  </div>
                </div>

                {/* Meals Overview */}
                <div className="p-5 flex-1 space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.06em] font-semibold block" style={{ color: "var(--text-tertiary)" }}>
                    Comidas preestablecidas
                  </span>
                  <div className="space-y-2.5">
                    {diet.meals.map((meal, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[12px] border-b border-dashed border-[var(--border-subtle)] pb-2 last:border-0 last:pb-0">
                        <div>
                          <strong className="font-semibold block" style={{ color: "var(--text-primary)" }}>{meal.name}</strong>
                          <span className="text-[11px] block mt-0.5 truncate max-w-[280px]" style={{ color: "var(--text-secondary)" }}>
                            {meal.items[0]}... ({meal.items.length} alimentos)
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 tabular-nums shrink-0 ml-2">
                          🕒 {meal.time} · {meal.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Routine Templates */}
        {activeTab === "routines" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
            {ROUTINE_TEMPLATES.map((routine) => (
              <div
                key={routine.id}
                className="rounded-xl border overflow-hidden flex flex-col"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-raised)]">
                  <h3 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{routine.name}</h3>
                  <span className="text-[11px] font-semibold tabular-nums text-zinc-600 bg-white border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full">
                    ⚡ {routine.daysPerWeek} días
                  </span>
                </div>

                {/* Days and exercises */}
                <div className="p-5 flex-1 space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.06em] font-semibold block" style={{ color: "var(--text-tertiary)" }}>
                    Estructura semanal
                  </span>
                  
                  <div className="space-y-3">
                    {routine.days.map((day, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[12px]">
                        <div className="flex justify-between font-semibold" style={{ color: "var(--text-primary)" }}>
                          <span>{day.day} · {day.label}</span>
                          <span className="text-[10px] font-normal" style={{ color: "var(--text-tertiary)" }}>
                            {day.exercises.length} Ejercicios
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                          Grupo muscular: <span className="font-medium">{day.muscleGroup}</span>
                        </p>
                        <div className="mt-2 text-[11px] space-y-0.5 text-zinc-400 pl-2 border-l border-zinc-200">
                          {day.exercises.slice(0, 2).map((ex, exIdx) => (
                            <div key={exIdx}>
                              • {ex.name} ({ex.sets}x{ex.reps})
                            </div>
                          ))}
                          {day.exercises.length > 2 && (
                            <div className="text-[9px] italic text-zinc-400">
                              + {day.exercises.length - 2} ejercicios más...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
