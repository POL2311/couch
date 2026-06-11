"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { CreditCard, AlertCircle, Loader2, ArrowRight, LogOut, RefreshCw } from "lucide-react";

export default function BlockedPage() {
  const router = useRouter();
  const [loading, setLoading]           = useState(false);
  const [retrying, setRetrying]         = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/me/coach-price", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMonthlyPrice(d.monthlyPrice ?? null))
      .catch(() => {});
  }, []);

  // Check whether the coach has since re-activated the account.
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    setError(null);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.ok) {
        // Account is now active — navigate to the portal without a full reload
        // so the portal's own fetchMe fires fresh and skips the blocked redirect.
        router.replace("/portal");
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (body.error === "ACCOUNT_BLOCKED") {
        setError("Tu cuenta sigue suspendida. Contacta a tu coach.");
      } else {
        setError("Error al verificar el estado. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setRetrying(false);
    }
  }, [router]);

  const handleReactivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/reactivate", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "No se pudo generar el enlace de pago.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "#000000" }}
    >
      {/* Card central */}
      <div
        className="w-full max-w-sm rounded-3xl px-6 py-10 flex flex-col items-center text-center"
        style={{
          background: "#121214",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Ícono de alerta */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.15)" }}
        >
          <AlertCircle size={28} strokeWidth={1.5} style={{ color: "#fb923c" }} />
        </div>

        {/* Título */}
        <h1
          className="text-[22px] font-semibold tracking-tight mb-2"
          style={{ color: "#ffffff" }}
        >
          Cuenta suspendida
        </h1>

        {/* Subtítulo */}
        <p
          className="text-[13px] leading-relaxed mb-1"
          style={{ color: "#8E8E93" }}
        >
          Tu acceso ha sido pausado por falta de pago.
        </p>
        <p
          className="text-[13px] leading-relaxed mb-8"
          style={{ color: "#8E8E93" }}
        >
          Activa tu suscripción para continuar con tu plan de entrenamiento.
        </p>

        {/* Detalle del plan */}
        <div
          className="w-full rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <CreditCard size={15} strokeWidth={1.75} style={{ color: "rgba(255,255,255,0.45)" }} />
            </div>
            <div className="text-left">
              <p className="text-[12px] font-medium" style={{ color: "#E5E5EA" }}>Plan mensual</p>
              <p className="text-[11px]" style={{ color: "#8E8E93" }}>Suscripción MyCoach</p>
            </div>
          </div>
          <p className="text-[15px] font-semibold tabular-nums" style={{ color: "#ffffff" }}>
            {monthlyPrice !== null
              ? `$${monthlyPrice.toLocaleString("es-MX")}`
              : "—"}
            {monthlyPrice !== null && (
              <span className="text-[10px] font-normal ml-0.5" style={{ color: "#8E8E93" }}>MXN/mes</span>
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-[12px] mb-4 px-4 py-2.5 rounded-xl w-full text-center"
            style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171" }}
          >
            {error}
          </p>
        )}

        {/* CTA principal */}
        <button
          onClick={handleReactivate}
          disabled={loading || retrying}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-semibold transition-opacity active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "#ffffff",
            color: "#000000",
            minHeight: 52,
          }}
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <>
              Reactivar suscripción
              <ArrowRight size={15} strokeWidth={2.5} />
            </>
          )}
        </button>

        {/* Secondary: check if coach re-activated */}
        <button
          onClick={handleRetry}
          disabled={loading || retrying}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-medium transition-opacity active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#8E8E93",
          }}
        >
          {retrying ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>
              <RefreshCw size={14} strokeWidth={1.75} />
              Mi coach me activó — reintentar acceso
            </>
          )}
        </button>
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-6 flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-60"
        style={{ color: "#8E8E93" }}
      >
        <LogOut size={12} strokeWidth={1.75} />
        Cerrar sesión
      </button>

      {/* Nota de pie */}
      <p className="mt-4 text-[11px] text-center max-w-[260px]" style={{ color: "rgba(255,255,255,0.15)" }}>
        ¿Problemas con el pago? Contacta a tu coach para asistencia.
      </p>
    </div>
  );
}
