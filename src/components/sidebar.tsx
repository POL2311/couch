"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/* ═══════════════════════════════════════════
   Icons — Thin stroke, minimal
   ═══════════════════════════════════════════ */

function IconDashboard({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  );
}

function IconUsers({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconTemplate({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function IconCalendar({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconPayments({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/coach", icon: IconDashboard },
  { label: "Alumnos", href: "/coach/students", icon: IconUsers },
  { label: "Plantillas", href: "/coach/templates", icon: IconTemplate },
  { label: "Periodización", href: "/coach/periodization", icon: IconCalendar },
  { label: "Pagos", href: "/coach/payments", icon: IconPayments },
];

/* ═══════════════════════════════════════════
   Desktop Sidebar — Minimal, weightless
   ═══════════════════════════════════════════ */

export function DesktopSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      id="sidebar-nav"
      className="desktop-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col"
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        transition: "width var(--transition-slow)",
        background: "var(--bg-sidebar)",
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
          {collapsed ? "M" : "MYCOUCH"}
        </span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 pt-6 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px]"
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
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Profile ── */}
      <div className="px-3 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-sidebar-subtle)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg cursor-pointer"
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
            CA
          </div>
          {!collapsed && (
            <div className="animate-fade-in text-left overflow-hidden flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--text-sidebar-primary)" }}>
                Coach Alejandro
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-sidebar-secondary)" }}>
                Pro · 47 alumnos
              </p>
            </div>
          )}
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
      className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        height: "64px",
        background: "var(--bg-sidebar)",
        borderTop: "1px solid var(--border-sidebar-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="navigation"
      aria-label="Navegación móvil"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center py-2 px-3"
            style={{
              color: isActive ? "var(--text-sidebar-primary)" : "var(--text-sidebar-secondary)",
              transition: "color var(--transition-fast)",
            }}
          >
            <Icon className="w-5 h-5" />
            {isActive && (
              <div
                className="w-1 h-1 rounded-full mt-1.5"
                style={{ background: "var(--text-sidebar-primary)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   Default Export — Composite
   ═══════════════════════════════════════════ */

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
