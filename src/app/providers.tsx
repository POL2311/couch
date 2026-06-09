"use client";

import { SessionProvider } from "next-auth/react";

/* ═══════════════════════════════════════════
   Parche de fetch (cliente): añade el header
   "ngrok-skip-browser-warning" a todas las llamadas
   a /api, para que la web funcione también cuando se
   sirve a través de un túnel de ngrok (demo). Es
   inofensivo en localhost y en producción (toro-max).
   ═══════════════════════════════════════════ */
let patched = false;
function patchFetch() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  const orig = window.fetch.bind(window);
  window.fetch = (input: any, init?: any) => {
    try {
      const url = typeof input === "string" ? input : input?.url ?? "";
      if (typeof url === "string" && (url.startsWith("/api") || url.includes("/api/"))) {
        const headers = new Headers(init?.headers || (typeof input !== "string" ? input?.headers : undefined));
        headers.set("ngrok-skip-browser-warning", "true");
        return orig(input, { ...init, headers });
      }
    } catch {
      /* si algo falla, usa el fetch original sin tocar */
    }
    return orig(input, init);
  };
}

export default function Providers({ children }: { children: React.ReactNode }) {
  patchFetch();
  return <SessionProvider>{children}</SessionProvider>;
}
