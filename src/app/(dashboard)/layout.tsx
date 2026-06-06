"use client";

import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-root)" }}>
      <Sidebar />

      <main
        className="main-content flex-1 min-w-0 flex flex-col min-h-screen md:ml-[var(--sidebar-width)] ml-0 overflow-x-clip transition-[margin-left] duration-350"
      >
        {children}
      </main>
    </div>
  );
}
