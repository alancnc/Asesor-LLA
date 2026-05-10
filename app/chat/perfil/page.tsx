"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

interface Profile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  profession?: string;
  country?: string;
  city?: string;
  phone?: string;
  language?: string;
  jurisdiction?: string;
  response_style?: string;
  email_notifications?: boolean;
}

const PROFESSIONS = [
  "Abogado",
  "Estudiante de Derecho",
  "Empresario",
  "Particular",
  "Otro",
];

const JURISDICTIONS = [
  "Argentina",
  "México",
  "España",
  "Colombia",
  "Chile",
  "Uruguay",
];

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
];

const STYLES = [
  { value: "technical", label: "Técnico-legal" },
  { value: "simple", label: "Simple y comprensible" },
  { value: "balanced", label: "Balanceado" },
];

const selectStyle: React.CSSProperties = {
  background: "var(--surface-3)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text-primary)",
  borderRadius: "12px",
  padding: "10px 16px",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
};

export default function PerfilPage() {
  const toast = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => setProfile(data ?? {}))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        toast.success("Perfil actualizado");
      } else {
        toast.error("Error al guardar");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        toast.success("Contraseña actualizada");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      toast.info("Cuenta eliminada");
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            Mi perfil
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Configurá tu información y preferencias
          </p>
        </div>

        {/* ── INFORMACIÓN PERSONAL ── */}
        <section
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            Información personal
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              name={profile.full_name}
              size={64}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                {profile.full_name ?? "Sin nombre"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Avatar generado a partir de tus iniciales
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nombre completo"
              value={profile.full_name ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Tu nombre"
            />
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Profesión
              </label>
              <select
                value={profile.profession ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, profession: e.target.value }))}
                style={selectStyle}
              >
                <option value="">Seleccioná...</option>
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Input
              label="País"
              value={profile.country ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
              placeholder="Argentina"
            />
            <Input
              label="Ciudad"
              value={profile.city ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              placeholder="Buenos Aires"
            />
            <Input
              label="Teléfono"
              value={profile.phone ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+54 11..."
              type="tel"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        </section>

        {/* ── SEGURIDAD ── */}
        <section
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            Seguridad
          </h2>

          <div className="space-y-3">
            <Input
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              error={passwordError || undefined}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí la nueva contraseña"
            />
          </div>

          <Button variant="secondary" loading={changingPassword} onClick={handlePasswordChange}>
            Cambiar contraseña
          </Button>

          {/* Danger zone */}
          <div
            className="mt-6 p-4 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#F87171" }}>
              Zona peligrosa
            </h3>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              Al eliminar tu cuenta se borrarán permanentemente todos tus datos y conversaciones.
            </p>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              Eliminar mi cuenta
            </Button>
          </div>
        </section>

        {/* ── PREFERENCIAS IA ── */}
        <section
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            Preferencias de IA
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Idioma
              </label>
              <select
                value={profile.language ?? "es"}
                onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))}
                style={selectStyle}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Jurisdicción
              </label>
              <select
                value={profile.jurisdiction ?? "Argentina"}
                onChange={(e) => setProfile((p) => ({ ...p, jurisdiction: e.target.value }))}
                style={selectStyle}
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Estilo de respuesta
              </label>
              <select
                value={profile.response_style ?? "balanced"}
                onChange={(e) => setProfile((p) => ({ ...p, response_style: e.target.value }))}
                style={selectStyle}
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                Notificaciones por email
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Recibí novedades y actualizaciones
              </p>
            </div>
            <button
              onClick={() => setProfile((p) => ({ ...p, email_notifications: !p.email_notifications }))}
              className="relative w-11 h-6 rounded-full transition-all duration-200"
              style={{
                background: profile.email_notifications ? "#7C3AED" : "var(--surface-4)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{ transform: profile.email_notifications ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Guardar preferencias
            </Button>
          </div>
        </section>

        {/* ── USO Y PLAN ── */}
        <section
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
              Uso y plan
            </h2>
            <Badge variant="violet">Plan Gratuito</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Consultas este mes", value: "—" },
              { label: "Documentos", value: "—" },
              { label: "Conversaciones", value: "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-4 text-center"
                style={{ background: "var(--surface-4)" }}
              >
                <p className="text-xl font-bold" style={{ color: "#A78BFA", fontFamily: "Syne, sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Button variant="secondary" className="w-full" onClick={() => toast.info("Próximamente disponible")}>
            Mejorar plan
          </Button>
        </section>
      </div>

      {/* Delete account modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
        title="Eliminar cuenta"
        danger
        confirmLabel="Eliminar permanentemente"
        onConfirm={handleDeleteAccount}
        confirmLoading={deletingAccount}
      >
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Esta acción es <strong style={{ color: "#F87171" }}>irreversible</strong>. Se eliminarán todos tus datos, conversaciones y documentos.
          </p>
          <Input
            label='Escribí "ELIMINAR" para confirmar'
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="ELIMINAR"
          />
        </div>
      </Modal>
    </div>
  );
}
