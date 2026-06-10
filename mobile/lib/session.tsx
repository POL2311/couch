/* ═══════════════════════════════════════════
   Sesión global (usuario autenticado)
   Envuelve la app y expone el usuario + acciones.
   ═══════════════════════════════════════════ */
import React, { createContext, useContext, useState, useCallback } from "react";
import { login as dataLogin, logout as dataLogout, type AuthUser } from "@/lib/data";

interface SessionState {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const u = await dataLogin(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await dataLogout();
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}

/** Ruta de inicio según el rol (espejo de la web: HOME_BY_ROLE). */
export function homeForRole(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/(admin)";
    case "COACH":
      return "/(coach)";
    case "CLIENT":
      return "/(portal)";
    default:
      return "/login";
  }
}
