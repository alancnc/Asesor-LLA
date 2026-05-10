"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  userEmail: string;
}

export default function Sidebar({ activeId, onSelect, onNew, userEmail }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/conversations");
    if (res.ok) setConversations(await res.json());
  }

  useEffect(() => { load(); }, [activeId]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Hoy";
    if (diff < 172800000) return "Ayer";
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden w-8 h-8 flex items-center justify-center rounded-lg"
        style={{ background: "#111", border: "1px solid #222" }}
        onClick={() => setOpen(!open)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full flex flex-col transition-transform duration-300 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: "240px",
          background: "#050505",
          borderRight: "1px solid #111",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-2" style={{ borderBottom: "1px solid #111" }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)" }}
          >
            <span style={{ fontSize: "13px" }}>⚖</span>
          </div>
          <span className="text-xs font-semibold tracking-widest" style={{ color: "#888", letterSpacing: "0.12em" }}>
            ASESOR LLA
          </span>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
            style={{ border: "1px solid #1a1a1a", color: "#666", background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a1a1a";
              (e.currentTarget as HTMLButtonElement).style.color = "#666";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva consulta
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 ? (
            <p className="text-xs text-center mt-8 px-4" style={{ color: "#333" }}>
              Tus consultas aparecerán aquí
            </p>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSelect(c.id); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: activeId === c.id ? "rgba(124,58,237,0.12)" : "transparent",
                    border: activeId === c.id ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (activeId !== c.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#0a0a0a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeId !== c.id) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }
                  }}
                >
                  <p
                    className="text-xs truncate"
                    style={{ color: activeId === c.id ? "#c4b5fd" : "#666" }}
                  >
                    {c.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#333", fontSize: "0.65rem" }}>
                    {formatDate(c.updated_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User + logout */}
        <div className="p-3" style={{ borderTop: "1px solid #111" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs truncate flex-1 mr-2" style={{ color: "#444" }}>
              {userEmail}
            </p>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-all"
              style={{ color: "#444", border: "1px solid #1a1a1a" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#888";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#333";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#444";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a1a1a";
              }}
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
