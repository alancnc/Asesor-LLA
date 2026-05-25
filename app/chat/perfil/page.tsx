"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useAvatar } from "@/contexts/AvatarContext";

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
}

const PROFESSIONS = ["Abogado", "Legislador", "Asesor Legislativo", "Estudiante de Derecho", "Otro"];

const JURISDICTIONS = [
  "Provincia de Misiones",
  "Nación Argentina",
  "Provincia de Buenos Aires",
  "Provincia de Córdoba",
  "Provincia de Santa Fe",
  "Provincia de Corrientes",
  "Otra provincia",
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

async function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("no canvas")); return; }
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PerfilPage() {
  const toast = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { setAvatarUrl: setGlobalAvatar } = useAvatar();

  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Security section (collapsible)
  const [showSecurity, setShowSecurity] = useState(false);
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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const updatedProfile = { ...profile, avatar_url: dataUrl };
      setProfile(updatedProfile);
      setGlobalAvatar(dataUrl); // sync across all components instantly
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      toast.success("Foto de perfil actualizada");
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setAvatarUploading(false);
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
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        toast.success("Contraseña actualizada");
        setNewPassword("");
        setConfirmPassword("");
        setShowSecurity(false);
      }
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="w-6 h-6 rounded-full border-2 border-violet-500"
          style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
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

          {/* Avatar with upload */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div
                className="cursor-pointer rounded-full"
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                title="Cambiar foto de perfil"
              >
                <Avatar src={profile.avatar_url} name={profile.full_name} size={64} />
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    opacity: avatarUploading ? 1 : 0,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  onMouseLeave={(e) => { if (!avatarUploading) (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                >
                  {avatarUploading ? (
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ borderColor: "#fff", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}
                    />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                {profile.full_name ?? "Sin nombre"}
              </p>
              <button
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                className="text-xs mt-0.5 transition-colors"
                style={{ color: "#A78BFA" }}
              >
                Cambiar foto
              </button>
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
              label="Ciudad"
              value={profile.city ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              placeholder="Posadas"
            />
            <Input
              label="Teléfono"
              value={profile.phone ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+54 376..."
              type="tel"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Guardar cambios
            </Button>
          </div>
        </section>

        {/* ── SEGURIDAD (collapsible) ── */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-3)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={() => setShowSecurity((v) => !v)}
            className="w-full flex items-center justify-between p-6 transition-colors"
            style={{ color: "#fff" }}
          >
            <h2 className="text-base font-semibold" style={{ fontFamily: "Syne, sans-serif" }}>
              Seguridad
            </h2>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{
                transform: showSecurity ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                color: "var(--text-secondary)",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSecurity && (
            <div className="px-6 pb-6 space-y-4">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Cambiá tu contraseña de acceso. Debe tener al menos 8 caracteres.
              </p>
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
            </div>
          )}
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
                value={profile.jurisdiction ?? "Provincia de Misiones"}
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

          <div className="flex justify-end">
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Guardar preferencias
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
