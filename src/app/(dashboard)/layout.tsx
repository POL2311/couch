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
        className="main-content flex-1 flex flex-col min-h-screen lg:ml-[var(--sidebar-width)] ml-0 transition-[margin-left] duration-350"
      >
        {children}
      </main>
    </div>
  );
}
