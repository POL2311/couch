import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   Shared chrome for the public legal / support pages
   (/soporte, /privacidad, /terminos) — no auth, no client JS
   required, so it renders instantly for App Store review.
══════════════════════════════════════════════════════════════ */

export const DS = "var(--font-display,'Barlow Condensed',sans-serif)";
export const MONO = "'Courier New', monospace";
export const ACCENT = "#CCFF00";
export const SURFACE = "#0F0F10";

const NAV_LINKS = [
  { href: "/soporte", label: "Soporte" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
];

export function LegalHeader() {
  return (
    <header
      className="sticky top-0 z-50 px-5 py-4 backdrop-blur-md"
      style={{ background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-black uppercase tracking-tight text-white shrink-0"
          style={{ fontFamily: DS, fontStyle: "italic", fontSize: 20 }}
        >
          MY<span style={{ color: ACCENT }}>COUCH</span>
        </Link>
        <nav className="flex items-center gap-4 overflow-x-auto">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors"
              style={{ fontFamily: MONO, color: "rgba(255,255,255,0.5)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function LegalFooter() {
  return (
    <footer
      className="px-5 py-8 mt-16"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: MONO }}>
          © {new Date().getFullYear()} MyCouch. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ fontFamily: MONO, color: "rgba(255,255,255,0.35)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function LegalHero({
  eyebrow,
  title,
  subtitle,
  meta,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <div className="max-w-3xl mx-auto px-5 pt-14 pb-8 text-center">
      <span
        className="inline-block text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1.5 rounded-full mb-5"
        style={{ fontFamily: MONO, color: ACCENT, background: "rgba(204,255,0,0.08)", border: "1px solid rgba(204,255,0,0.25)" }}
      >
        {eyebrow}
      </span>
      <h1
        className="font-black uppercase text-white leading-[0.95]"
        style={{ fontFamily: DS, fontStyle: "italic", fontSize: "clamp(32px,8vw,52px)", letterSpacing: "-0.01em" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {subtitle}
        </p>
      )}
      {meta && (
        <p className="mt-3 text-[11px] uppercase tracking-widest" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.3)" }}>
          {meta}
        </p>
      )}
    </div>
  );
}

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000000", color: "#fff" }}>
      <LegalHeader />
      <main className="flex-1 w-full">{children}</main>
      <LegalFooter />
    </div>
  );
}

/** Rounded surface card used for every content block on the legal pages. */
export function LegalCard({
  children,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Highlights the card with the neon accent border — for critical clauses (e.g. medical disclaimer). */
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 ${className}`}
      style={{ background: SURFACE, border: `1px solid ${accent ? "rgba(204,255,0,0.35)" : "rgba(255,255,255,0.08)"}` }}
    >
      {children}
    </div>
  );
}

export function LegalSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-black uppercase text-white mb-3"
      style={{ fontFamily: DS, fontStyle: "italic", fontSize: "clamp(19px,4vw,24px)" }}
    >
      {children}
    </h2>
  );
}
