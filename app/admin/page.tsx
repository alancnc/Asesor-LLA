"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Registration {
  id: string;
  email: string;
  full_name: string | null;
  requested_at: string;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  notes: string | null;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  profession: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  status: string;
  conversation_count: number;
}

interface AdminConversation {
  id: string;
  title: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface Stats {
  total_users: number;
  pending_users: number;
  conversations_today: number;
  conversations_month: number;
  messages_today: number;
  messages_month: number;
  top_users: { name: string; email: string; count: number }[];
  daily_activity: { date: string; count: number }[];
}

interface Message { role: string; content: string; created_at: string; }

type Tab = "solicitudes" | "usuarios" | "conversaciones" | "estadisticas" | "configuracion";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "rgba(245,158,11,0.15)", color: "#FBBF24", label: "Pendiente" },
    approved: { bg: "rgba(34,197,94,0.15)", color: "#4ADE80", label: "Aprobado" },
    rejected: { bg: "rgba(239,68,68,0.15)", color: "#F87171", label: "Rechazado" },
    legacy: { bg: "rgba(99,102,241,0.15)", color: "#818CF8", label: "Legado" },
  };
  const s = map[status] ?? map.legacy;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function fmtDate(iso: string) {
  try { return format(new Date(iso), "d MMM yyyy HH:mm", { locale: es }); } catch { return iso; }
}

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-px" style={{ height: "80px" }}>
      {data.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count} mensajes`}
          className="flex-1 rounded-t-sm transition-all"
          style={{
            height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%`,
            background: d.count > 0 ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.04)",
            minHeight: "2px",
          }}
        />
      ))}
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "var(--surface-3)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
  padding: "20px",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-secondary)",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "12px",
  fontSize: "0.82rem",
  color: "var(--text-primary)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  verticalAlign: "middle",
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function SolicitudesTab() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/registrations");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, status: "approved" | "rejected") {
    setActing(id);
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setActing(null);
  }

  const pending = data.filter((r) => r.status === "pending");
  const filtered = filter === "all" ? data : data.filter((r) => r.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>Solicitudes de Acceso</h2>
          {pending.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: "#FBBF24" }}>{pending.length} pendiente{pending.length !== 1 ? "s" : ""} de revisión</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all","pending","approved","rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs v-hover"
              style={{
                background: filter === f ? "rgba(124,58,237,0.2)" : "var(--surface-4)",
                border: `1px solid ${filter === f ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                color: filter === f ? "#A78BFA" : "var(--text-secondary)",
              }}
            >
              {{ all:"Todos", pending:"Pendientes", approved:"Aprobados", rejected:"Rechazados" }[f]}
              {f === "pending" && pending.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#FBBF24", color: "#000" }}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>Sin registros</p>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Nombre", "Email", "Solicitado", "Estado", "Acciones"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="v-hover" style={{ cursor: "default" }}>
                    <td style={td}>{r.full_name ?? "—"}</td>
                    <td style={td}>{r.email}</td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{fmtDate(r.requested_at)}</td>
                    <td style={td}><Badge status={r.status} /></td>
                    <td style={td}>
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            disabled={acting === r.id}
                            onClick={() => act(r.id, "approved")}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all v-hover"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.25)" }}
                          >
                            Aprobar
                          </button>
                          <button
                            disabled={acting === r.id}
                            onClick={() => act(r.id, "rejected")}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all v-hover"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" }}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function UsuariosTab() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>Usuarios Activos</h2>

      {selected && (
        <div style={{ ...sectionStyle, background: "var(--surface-2)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff" }}>
                {(selected.full_name || selected.email).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#fff" }}>{selected.full_name || selected.email}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selected.email}</p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="v-hover w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Conversaciones", value: selected.conversation_count },
              { label: "Estado", value: <Badge status={selected.status} /> },
              { label: "Profesión", value: selected.profession ?? "—" },
              { label: "Último acceso", value: selected.last_sign_in_at ? fmtDate(selected.last_sign_in_at) : "—" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl" style={{ background: "var(--surface-4)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                <p className="text-sm font-medium" style={{ color: "#fff" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={sectionStyle}>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Usuario", "Email", "Estado", "Conversaciones", "Registro"].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id} onClick={() => setSelected(u)} className="v-hover" style={{ cursor: "pointer" }}>
                    <td style={td}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff" }}>
                          {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate" style={{ maxWidth: "140px" }}>{u.full_name || "—"}</span>
                      </div>
                    </td>
                    <td style={td}>{u.email}</td>
                    <td style={td}><Badge status={u.status} /></td>
                    <td style={{ ...td, textAlign: "center" }}>{u.conversation_count}</td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversacionesTab() {
  const [data, setData] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    setLoading(true);
    fetch(`/api/admin/conversations${q}`).then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, [search]);

  async function openConv(conv: AdminConversation) {
    setSelected(conv);
    setLoadingMsgs(true);
    const res = await fetch(`/api/admin/conversations/${conv.id}`);
    if (res.ok) setMessages(await res.json());
    setLoadingMsgs(false);
  }

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelected(null); setMessages([]); }} className="v-hover w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#fff" }}>{selected.title}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{selected.user_name} · {fmtDate(selected.updated_at)}</p>
          </div>
        </div>
        <div style={{ ...sectionStyle, maxHeight: "60vh", overflowY: "auto" }}>
          {loadingMsgs ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /></div>
          ) : messages.map((m, i) => (
            <div key={i} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-lg px-4 py-3 rounded-2xl text-sm" style={{
                background: m.role === "user" ? "#7C3AED" : "var(--surface-4)",
                color: "#fff",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              }}>
                {m.role === "assistant"
                  ? <div className="prose-dark text-xs"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>
                  : <p style={{ fontSize: "0.82rem" }}>{m.content}</p>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>Conversaciones</h2>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-0 max-w-xs"
          style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#fff" }} />
        </div>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /></div>
        ) : data.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>Sin conversaciones</p>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Título", "Usuario", "Mensajes", "Última actividad"].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id} onClick={() => openConv(c)} className="v-hover" style={{ cursor: "pointer" }}>
                    <td style={td}><span className="truncate block" style={{ maxWidth: "260px" }}>{c.title}</span></td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{c.user_name || c.user_email}</td>
                    <td style={{ ...td, textAlign: "center" }}>{c.message_count}</td>
                    <td style={{ ...td, color: "var(--text-secondary)" }}>{fmtDate(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EstadisticasTab() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /></div>;
  if (!data) return null;

  const statCards = [
    { label: "Usuarios totales", value: data.total_users, color: "#A78BFA" },
    { label: "Solicitudes pendientes", value: data.pending_users, color: "#FBBF24" },
    { label: "Conversaciones hoy", value: data.conversations_today, color: "#34D399" },
    { label: "Conversaciones este mes", value: data.conversations_month, color: "#34D399" },
    { label: "Mensajes hoy", value: data.messages_today, color: "#60A5FA" },
    { label: "Mensajes este mes", value: data.messages_month, color: "#60A5FA" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>Estadísticas Generales</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div key={s.label} style={sectionStyle}>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "Syne, sans-serif" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <p className="text-sm font-medium mb-4" style={{ color: "#fff" }}>Actividad diaria (últimos 30 días)</p>
        <BarChart data={data.daily_activity} />
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{data.daily_activity[0]?.date}</span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{data.daily_activity[data.daily_activity.length - 1]?.date}</span>
        </div>
      </div>

      <div style={sectionStyle}>
        <p className="text-sm font-medium mb-4" style={{ color: "#fff" }}>Usuarios más activos</p>
        {data.top_users.length === 0
          ? <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sin datos</p>
          : (
            <div className="space-y-2">
              {data.top_users.map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-5 text-center" style={{ color: "var(--text-secondary)" }}>#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: "#fff" }}>{u.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{u.email}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#A78BFA" }}>{u.count}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function ConfiguracionTab() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then((r) => r.json()).then(setConfig).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const taStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface-4)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-primary)",
    borderRadius: "10px",
    padding: "12px",
    fontSize: "0.82rem",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
    fontFamily: "DM Sans, sans-serif",
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>Configuración del Sistema</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            background: saved ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
            color: saved ? "#4ADE80" : "#fff",
            border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
            boxShadow: saving || saved ? "none" : "0 0 16px rgba(124,58,237,0.3)",
          }}
        >
          {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar cambios"}
        </button>
      </div>

      {[
        {
          key: "system_prompt_override",
          label: "Prompt del sistema",
          description: "Reemplaza el prompt del sistema que reciben todos los usuarios. Dejá vacío para usar el prompt por defecto del código.",
          rows: 10,
        },
        {
          key: "welcome_message",
          label: "Mensaje de bienvenida",
          description: "Subtítulo que aparece en la pantalla inicial del chat.",
          rows: 3,
        },
        {
          key: "suggested_questions",
          label: "Preguntas sugeridas (JSON)",
          description: 'Array JSON con las preguntas. Ejemplo: ["Pregunta 1", "Pregunta 2"]',
          rows: 6,
        },
      ].map((field) => (
        <div key={field.key} style={sectionStyle}>
          <label className="block text-sm font-semibold mb-1" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            {field.label}
          </label>
          <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{field.description}</p>
          <textarea
            rows={field.rows}
            value={config[field.key] ?? ""}
            onChange={(e) => setConfig((c) => ({ ...c, [field.key]: e.target.value }))}
            style={taStyle}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "solicitudes", label: "Solicitudes", icon: "📋" },
  { id: "usuarios", label: "Usuarios", icon: "👥" },
  { id: "conversaciones", label: "Conversaciones", icon: "💬" },
  { id: "estadisticas", label: "Estadísticas", icon: "📊" },
  { id: "configuracion", label: "Configuración", icon: "⚙️" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("solicitudes");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data: Registration[]) => setPendingCount(data.filter((r) => r.status === "pending").length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-1)" }}>
      {/* Admin sidebar */}
      <aside
        className="flex flex-col h-full flex-shrink-0"
        style={{
          width: "220px",
          background: "var(--surface-2)",
          borderRight: "1px solid rgba(124,58,237,0.1)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)" }}>
            <span style={{ fontSize: "14px" }}>⚖</span>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>ADMIN</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Panel de control</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200${activeTab === t.id ? "" : " v-hover"}`}
              style={{
                background: activeTab === t.id ? "rgba(124,58,237,0.15)" : "transparent",
                color: activeTab === t.id ? "#A78BFA" : "var(--text-secondary)",
                borderLeft: `3px solid ${activeTab === t.id ? "#7C3AED" : "transparent"}`,
                fontFamily: "DM Sans, sans-serif",
                textAlign: "left",
              }}
            >
              <span>{t.icon}</span>
              <span className="flex-1">{t.label}</span>
              {t.id === "solicitudes" && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#FBBF24", color: "#000" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Back link */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <a href="/chat" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs v-hover" style={{ color: "var(--text-secondary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Volver al chat
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "solicitudes" && <SolicitudesTab />}
          {activeTab === "usuarios" && <UsuariosTab />}
          {activeTab === "conversaciones" && <ConversacionesTab />}
          {activeTab === "estadisticas" && <EstadisticasTab />}
          {activeTab === "configuracion" && <ConfiguracionTab />}
        </div>
      </main>
    </div>
  );
}
