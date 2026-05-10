"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { es } from "date-fns/locale";
import Modal from "@/components/ui/Modal";
import { ConversationSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  preview?: string;
}

type FilterType = "all" | "today" | "week" | "month";

export default function HistorialPage() {
  const router = useRouter();
  const toast = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) setConversations(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conversations/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== deleteId));
        toast.success("Conversación eliminada");
      } else {
        toast.error("Error al eliminar");
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      const date = new Date(c.updated_at);
      if (filter === "today") return isToday(date);
      if (filter === "week") return isThisWeek(date, { weekStartsOn: 1 });
      if (filter === "month") return isThisMonth(date);
      return true;
    });
  }, [conversations, search, filter]);

  function formatDate(iso: string) {
    const d = new Date(iso);
    if (isToday(d)) return format(d, "'Hoy,' HH:mm", { locale: es });
    if (isThisWeek(d, { weekStartsOn: 1 })) return format(d, "EEEE, HH:mm", { locale: es });
    return format(d, "d MMM yyyy", { locale: es });
  }

  const filterLabels: Record<FilterType, string> = {
    all: "Todos",
    today: "Hoy",
    week: "Esta semana",
    month: "Este mes",
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            Historial de consultas
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {conversations.length} conversación{conversations.length !== 1 ? "es" : ""} guardada{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "var(--surface-3)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(Object.keys(filterLabels) as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === f ? "rgba(124,58,237,0.2)" : "var(--surface-3)",
                border: `1px solid ${filter === f ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                color: filter === f ? "#A78BFA" : "var(--text-secondary)",
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <ConversationSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--text-secondary)" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "#fff" }}>
              {search ? "Sin resultados" : "Sin conversaciones"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {search ? "Probá con otra búsqueda" : "Iniciá tu primera consulta jurídica"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: "var(--surface-3)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                onClick={() => {
                  localStorage.setItem("__loadConvId", c.id);
                  router.push("/chat");
                }}
              >
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <span style={{ fontSize: "16px" }}>⚖</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#fff" }}>
                    {c.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(c.updated_at)}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    color: "#F87171",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                  title="Eliminar"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar conversación"
        danger
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        confirmLoading={deleting}
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Esta acción no se puede deshacer. ¿Estás seguro que querés eliminar esta conversación?
        </p>
      </Modal>
    </div>
  );
}
