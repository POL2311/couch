"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Coach", email: "coach@mycoach.app", password: "coach123" },
  { role: "Admin", email: "admin@mycoach.app", password: "admin123" },
  { role: "Cliente", email: "cliente@mycoach.app", password: "cliente123" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Correo o contraseña incorrectos.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Ocurrió un error al iniciar sesión.");
      setLoading(false);
    }
  };

  const fillDemo = (acc: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "var(--bg-root)" }}
    >
      <div className="w-full max-w-[380px] animate-fade-in">
        {/* Marca */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)" }}
          >
            <ShieldCheck size={22} strokeWidth={1.75} style={{ color: "var(--text-primary)" }} />
          </div>
          <h1 className="text-[15px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--text-primary)" }}>
            MyCoach
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Tarjeta */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="px-3.5 py-2.5 rounded-xl text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
              style={{ background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-secondary)" }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-3.5 py-2.5 rounded-xl text-[13px] outline-none border focus:border-[var(--border-strong)] transition-all duration-150"
              style={{ background: "var(--bg-surface-raised)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
            />
          </div>

          {error && (
            <p
              className="text-[12px] px-3 py-2 rounded-xl animate-fade-in"
              style={{ background: "var(--color-danger-subtle)", color: "var(--color-danger)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: "var(--accent-primary)", color: "var(--text-inverse)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Entrar <ArrowRight size={15} strokeWidth={2} /></>}
          </button>
        </form>

        {/* Cuentas demo */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-wider font-medium text-center mb-3" style={{ color: "var(--text-tertiary)" }}>
            Cuentas de demostración
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className="px-2 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
