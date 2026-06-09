"use client";

/* ═══════════════════════════════════════════
   Perfil del admin (WEB) — paridad con la app
   (mobile/app/(admin)/(tabs)/profile.tsx).
   ═══════════════════════════════════════════ */
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ArrowLeft, LogOut, Mail, ShieldCheck } from "lucide-react";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="max-w-md mx-auto px-4 md:px-8 py-8">
      {/* Volver */}
      <Link href="/admin" className="inline-flex items-center gap-2 mb-6 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      {/* Identidad */}
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}>
          <ShieldCheck size={26} strokeWidth={1.75} style={{ color: "var(--text-primary)" }} />
        </div>
        <h1 className="text-[20px] font-semibold mt-3" style={{ color: "var(--text-primary)" }}>{user?.name ?? "Administrador"}</h1>
        <div className="mt-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>ADMIN · Panel global</span>
        </div>
      </div>

      {/* Correo */}
      <div className="rounded-2xl mt-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center px-5 py-4">
          <Mail size={16} strokeWidth={1.75} style={{ color: "var(--text-tertiary)" }} />
          <span className="text-[13px] ml-3 flex-1" style={{ color: "var(--text-tertiary)" }}>Correo</span>
          <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>{user?.email}</span>
        </div>
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl mt-4 cursor-pointer transition-opacity hover:opacity-85"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--color-danger)" }}
      >
        <LogOut size={16} /> <span className="text-[14px] font-medium">Cerrar sesión</span>
      </button>
    </div>
  );
}
