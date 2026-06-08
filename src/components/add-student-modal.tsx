"use client";

import { useState } from "react";
import { type Stage } from "@/lib/mock-data";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    email: string;
    stage: Stage;
    stageNumber: number;
    startingWeight: number;
    height: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    photo?: File | null;
  }) => void;
}

export default function AddStudentModal({ isOpen, onClose, onAdd }: AddStudentModalProps) {
  // Wizard State
  const [step, setStep] = useState(1);

  // Step 1: Registro
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("Volumen");
  const [stageNumber, setStageNumber] = useState(1);

  // Step 2: Físico
  const [startingWeight, setStartingWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  // Step 3: Medidas
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");

  // Step 4: Fotos
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    // Basic validation per step
    if (step === 1) {
      if (!name || !email) return;
    } else if (step === 2) {
      if (!startingWeight || !height) return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If we are on step 1 or 2, check validation first
      if (step === 1 && (!name || !email)) return;
      if (step === 2 && (!startingWeight || !height)) return;

      if (step < 4) {
        handleNext();
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    if (!name || !email || !startingWeight || !height) return;

    onAdd({
      name,
      email,
      stage,
      stageNumber,
      startingWeight: parseFloat(startingWeight),
      height: parseFloat(height),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      photo: uploadedFile,
    });

    // Reset Form & Wizard
    setName("");
    setEmail("");
    setStage("Volumen");
    setStageNumber(1);
    setStartingWeight("");
    setHeight("");
    setBodyFat("");
    setChest("");
    setWaist("");
    setHips("");
    setUploadedFile(null);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
        style={{ background: "var(--scrim)" }}
        onClick={() => {
          setStep(1);
          onClose();
        }}
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
            Nuevo Alumno
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Paso {step} de 4 · Completa los detalles estructurados.
          </p>
        </div>

        {/* Wizard Segmented Progress Header */}
        <div className="flex gap-1.5 px-6 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          {[
            { num: 1, label: "Registro" },
            { num: 2, label: "Físico" },
            { num: 3, label: "Medidas" },
            { num: 4, label: "Fotos" },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex flex-col gap-1">
              <div
                className="h-1 rounded-full transition-all duration-350"
                style={{
                  background: step >= s.num ? "var(--text-primary)" : "var(--border-subtle)",
                }}
              />
              <span
                className="text-[9px] uppercase tracking-wider font-semibold"
                style={{
                  color: step === s.num ? "var(--text-primary)" : "var(--text-tertiary)",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleFormSubmit} className="p-6">
          <div className="min-h-[260px] flex flex-col justify-center">
            {/* STEP 1: Datos de Registro */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                    style={{
                      background: "var(--bg-surface-raised)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. juan.perez@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                    style={{
                      background: "var(--bg-surface-raised)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                      Etapa Objetivo
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as Stage)}
                      onKeyDown={handleKeyDown}
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
                      onKeyDown={handleKeyDown}
                      className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                      style={{
                        background: "var(--bg-surface-raised)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Composición Corporal */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                      Peso Actual (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej. 74.5"
                      value={startingWeight}
                      onChange={(e) => setStartingWeight(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                      style={{
                        background: "var(--bg-surface-raised)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                      Estatura (cm)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ej. 176"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                      style={{
                        background: "var(--bg-surface-raised)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                    % Grasa / InBody (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 14.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                    style={{
                      background: "var(--bg-surface-raised)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Medidas Corporales */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  Ingresa las medidas del alumno en centímetros (todas opcionales).
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                    Pecho (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 92.5"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                    style={{
                      background: "var(--bg-surface-raised)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                      Cintura (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ej. 82.0"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                      style={{
                        background: "var(--bg-surface-raised)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                      Cadera (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ej. 98.4"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="px-3.5 py-2.5 rounded-lg text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
                      style={{
                        background: "var(--bg-surface-raised)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Registro Fotográfico */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
                  Foto de Progreso o Ficha InBody (Opcional)
                </label>
                
                <div
                  className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--text-primary)] transition-all duration-150"
                  style={{
                    background: "var(--bg-surface-raised)",
                    borderColor: uploadedFile ? "var(--text-primary)" : "var(--border-default)",
                  }}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFile(file);
                    }}
                  />
                  {uploadedFile ? (
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-[color:var(--color-success)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>{uploadedFile.name}</p>
                      <button
                        type="button"
                        className="text-[10px] mt-2 hover:underline cursor-pointer text-[color:var(--color-danger)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                      >
                        Remover foto
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>Haga clic para subir una foto</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Formatos: JPG, PNG (máx. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 mt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {/* Left side: Back / Cancel */}
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150"
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
                Atrás
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150"
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
            )}

            {/* Right side: Next / Submit */}
            {step < 4 ? (
              <button
                key="btn-next"
                type="button"
                onClick={handleNext}
                disabled={(step === 1 && (!name || !email)) || (step === 2 && (!startingWeight || !height))}
                className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
                Siguiente
              </button>
            ) : (
              <button
                key="btn-submit"
                type="submit"
                className="px-4 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150"
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
                Agregar Alumno
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
