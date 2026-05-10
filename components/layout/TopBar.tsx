"use client";

import { usePathname } from "next/navigation";

interface TopBarProps {
  onMenuToggle: () => void;
  user: { email?: string; full_name?: string } | null;
}

const routeTitles: Record<string, string> = {
  "/chat": "LexIA — Asesor Jurídico",
  "/chat/historial": "Historial de consultas",
  "/chat/documentos": "Documentos",
  "/chat/perfil": "Mi perfil",
};

export default function TopBar({ onMenuToggle, user }: TopBarProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? "LexIA — Asesor Jurídico";

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-4 z-30"
      style={{
        height: "60px",
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124,58,237,0.1)",
      }}
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: "var(--text-secondary)" }}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1
          className="text-sm font-semibold"
          style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}
        >
          {title}
        </h1>
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Notificaciones"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff" }}
          title={user?.email}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
