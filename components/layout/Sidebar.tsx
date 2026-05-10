"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  collapsed: boolean;
  user: { email?: string; full_name?: string } | null;
}

const navItems = [
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/chat/historial",
    label: "Historial",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/chat/perfil",
    label: "Perfil",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function Sidebar({ collapsed, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/chat") return pathname === "/chat";
    return pathname.startsWith(href);
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="h-full flex flex-col transition-all duration-300"
      style={{
        width: collapsed ? "72px" : "260px",
        background: "var(--surface-2)",
        borderRight: "1px solid rgba(124,58,237,0.12)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
            boxShadow: "0 0 20px rgba(124,58,237,0.35)",
          }}
        >
          <span style={{ fontSize: "16px" }}>⚖</span>
        </div>
        {!collapsed && (
          <div>
            <span
              className="text-sm font-bold tracking-widest"
              style={{ color: "#fff", fontFamily: "Syne, sans-serif", letterSpacing: "0.12em" }}
            >
              ASESOR LLA
            </span>
            <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: "1px" }}>
              LexIA · Asesor Jurídico
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl transition-all duration-150"
                style={{
                  padding: collapsed ? "10px 0" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "rgba(124,58,237,0.15)" : "transparent",
                  borderLeft: active ? "3px solid #7C3AED" : "3px solid transparent",
                  color: active ? "#A78BFA" : "var(--text-secondary)",
                }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User + logout */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff" }}
            >
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {user?.full_name && (
                <p className="text-xs font-medium truncate" style={{ color: "#fff" }}>
                  {user.full_name}
                </p>
              )}
              <p className="text-xs truncate" style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                {user?.email ?? ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
