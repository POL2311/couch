"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";

const STORAGE_KEY = "sidebar-collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Cargar preferencia (useEffect temprano; el SSR renderiza expandido).
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggleCollapse = () =>
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });

  return (
    <div
      className="flex min-h-screen"
      data-sidebar={collapsed ? "collapsed" : "expanded"}
      style={{ background: "var(--bg-root)" }}
    >
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <main className="main-content flex-1 min-w-0 flex flex-col min-h-screen md:ml-[var(--sidebar-width)] ml-0 overflow-x-clip">
        {children}
      </main>
    </div>
  );
}
