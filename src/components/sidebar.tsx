"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutGrid, Users, FileText, CalendarRange, CreditCard, LogOut } from "lucide-react";

/* ═══════════════════════════════════════════
   Navegación — Iconos Lucide (líneas finas)
   ═══════════════════════════════════════════ */

const NAV_ITEMS: { label: string; shortLabel?: string; href: string; icon: typeof LayoutGrid }[] = [
  { label: "Dashboard", href: "/coach", icon: LayoutGrid },
  { label: "Alumnos", href: "/coach/students", icon: Users },
  { label: "Plantillas", href: "/coach/templates", icon: FileText },
  // shortLabel: etiqueta corta para el bottom bar móvil; el sidebar de escritorio usa label.
  { label: "Periodización", shortLabel: "Períodos", href: "/coach/periodization", icon: CalendarRange },
  { label: "Pagos", href: "/coach/payments", icon: CreditCard },
];

/* Fuente única del estado activo: la raíz (/coach) solo por igualdad exacta;
   el resto por igualdad o prefijo de segmento. */
function isActiveRoute(pathname: string, href: string) {
  if (href === "/coach") return pathname === "/coach";
  return pathname === href || pathname.startsWith(href + "/");
}

/* ═══════════════════════════════════════════
   Desktop Sidebar — Minimal, weightless
   ═══════════════════════════════════════════ */

const ROLE_LABELS: Record<string, string> = { COACH: "Coach", ADMIN: "Administrador", CLIENT: "Cliente" };

export function DesktopSidebar({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "CO";

  return (
    <aside
      id="sidebar-nav"
      className="desktop-sidebar hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col backdrop-blur-xl"
      style={{
        width: "var(--sidebar-width)",
        transition: "width var(--transition-slow)",
        background: "var(--bg-sidebar)",
        WebkitBackdropFilter: "blur(24px)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid var(--border-subtle)",
      }}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: "var(--header-height)" }}
      >
        <span
          className="text-[13px] font-semibold tracking-[0.2em] uppercase shrink-0"
          style={{ color: "var(--text-primary)" }}
        >
          {collapsed ? "M" : "MYCOACH"}
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-6 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              aria-label={item.label}
              className={`group relative flex items-center gap-3 py-2.5 rounded-xl text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring-on-dark)] ${collapsed ? "justify-center px-0" : "px-3"}`}
              style={{
                color: isActive ? "var(--text-sidebar-primary)" : "var(--text-sidebar-secondary)",
                background: isActive ? "var(--bg-sidebar-active)" : "transparent",
                fontWeight: isActive ? 500 : 400,
                transition: "all var(--transition-fast)",
                letterSpacing: isActive ? "0.01em" : "0",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bg-sidebar-hover)";
                  e.currentTarget.style.color = "var(--text-sidebar-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-sidebar-secondary)";
                }
              }}
            >
              <Icon strokeWidth={1.5} className={`w-[18px] h-[18px] shrink-0 ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {/* Tooltip (solo colapsado): nombre accesible al hover/focus */}
              {collapsed && (
                <span
                  role="tooltip"
                  className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg text-[12px] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-opacity duration-150"
                  style={{ background: "var(--bg-surface-raised)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", boxShadow: "var(--shadow-md)" }}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Profile ── */}
      <div className="px-3 py-4 shrink-0 space-y-1" style={{ borderTop: "1px solid var(--border-sidebar-subtle)" }}>
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          aria-expanded={!collapsed}
          className={`flex items-center gap-3 py-2 w-full rounded-xl cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring-on-dark)] ${collapsed ? "justify-center px-0" : "px-3"}`}
          style={{ transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-sidebar-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium"
            style={{
              background: "var(--bg-surface-overlay)",
              color: "var(--text-sidebar-secondary)",
              border: "1px solid var(--border-sidebar-subtle)",
            }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="animate-fade-in text-left overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-sidebar-primary)" }}>
                {user?.name ?? "Coach"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-sidebar-secondary)" }}>
                {ROLE_LABELS[user?.role ?? "COACH"] ?? "Coach"}
              </p>
            </div>
          )}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className={`flex items-center gap-3 py-2 w-full rounded-xl cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring-on-dark)] ${collapsed ? "justify-center px-0" : "px-3"}`}
          style={{ color: "var(--text-sidebar-secondary)", transition: "all var(--transition-fast)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-sidebar-hover)"; e.currentTarget.style.color = "var(--text-sidebar-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-sidebar-secondary)"; }}
        >
          <LogOut strokeWidth={1.5} className="w-[18px] h-[18px] shrink-0 opacity-60" />
          {!collapsed && <span className="text-[13px]">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════
   Mobile Bottom Navigation
   ═══════════════════════════════════════════ */

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide the global mobile bottom nav on the student detail page
  const isStudentDetailPage = pathname.startsWith("/coach/students/") && pathname !== "/coach/students";
  if (isStudentDetailPage) return null;

  return (
    <nav
      className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 items-center backdrop-blur-xl"
      style={{
        height: "72px",
        background: "var(--bg-sidebar)",
        WebkitBackdropFilter: "blur(24px)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border-sidebar-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="navigation"
      aria-label="Navegación móvil"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 min-w-0 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[color:var(--ring-on-dark)]"
            style={{
              minHeight: 44,
              color: isActive ? "var(--text-sidebar-primary)" : "var(--text-sidebar-secondary)",
              transition: "color var(--transition-fast)",
            }}
          >
            <Icon strokeWidth={1.5} className="w-6 h-6 shrink-0" />
            <span
              className="text-[10px] tracking-tight truncate max-w-full"
              style={{ fontWeight: isActive ? 600 : 400 }}
            >
              {item.shortLabel ?? item.label}
            </span>
          </Link>
        );
      })}

      {/* Logout tab */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        aria-label="Cerrar sesión"
        className="flex flex-col items-center justify-center gap-1 py-2 px-1 w-full outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[color:var(--ring-on-dark)] active:opacity-60"
        style={{
          minHeight: 44,
          color: "var(--text-sidebar-secondary)",
          transition: "color var(--transition-fast)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-sidebar-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sidebar-secondary)"; }}
      >
        <LogOut strokeWidth={1.5} className="w-6 h-6 shrink-0 opacity-70" />
        <span className="text-[10px] tracking-tight">Salir</span>
      </button>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   Default Export — Composite
   ═══════════════════════════════════════════ */

export default function Sidebar({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  return (
    <>
      <DesktopSidebar collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      <MobileBottomNav />
    </>
  );
}
