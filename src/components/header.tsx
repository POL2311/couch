"use client";

import { useState } from "react";

function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconPlus({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewStudent?: () => void;
}

export default function Header({ title, subtitle, onNewStudent }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      id="dashboard-header"
      className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-8 shrink-0"
      style={{
        height: "var(--header-height)",
        background: "rgba(3, 3, 3, 0.7)",
        backdropFilter: "blur(20px) saturate(120%)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Title ── */}
      <div className="mr-auto">
        <h1
          className="text-[15px] font-medium tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Search ── */}
      <div
        className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-lg w-56"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          transition: "border-color var(--transition-fast)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--border-strong)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
        }}
      >
        <IconSearch
          className="w-3.5 h-3.5 shrink-0"
          /* @ts-expect-error - style on SVG is fine in React */
          style={{ color: "var(--text-tertiary)" }}
        />
        <input
          id="global-search"
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none text-[13px] flex-1 min-w-0"
          style={{ color: "var(--text-primary)" }}
        />
        <kbd
          className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono"
          style={{
            background: "var(--bg-surface-raised)",
            color: "var(--text-tertiary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* ── New Student — High Contrast White ── */}
      <button
        id="btn-new-student"
        onClick={onNewStudent}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
        style={{
          background: "var(--text-primary)",
          color: "var(--text-inverse)",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <IconPlus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Nuevo Alumno</span>
      </button>
    </header>
  );
}
