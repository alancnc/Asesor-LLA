"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PageState = "form" | "pending";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Register in pending_registrations
    if (data.user) {
      await fetch("/api/register-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: fullName }),
      });
      // Sign out immediately — user must wait for approval
      await supabase.auth.signOut();
    }

    setLoading(false);
    setPageState("pending");
  }

  const inputStyle: React.CSSProperties = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    color: "#ffffff",
  };

  if (pageState === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000" }}>
        <div className="w-full max-w-sm text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", boxShadow: "0 0 24px rgba(124,58,237,0.3)" }}
          >
            <span style={{ fontSize: "26px" }}>⏳</span>
          </div>
          <h1 className="text-xl font-semibold mb-3" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            Solicitud enviada
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#888" }}>
            Tu solicitud de acceso fue enviada correctamente. El administrador revisará tu cuenta y recibirás acceso una vez aprobada.
          </p>
          <div
            className="p-4 rounded-xl text-sm"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#A78BFA" }}
          >
            <strong>{email}</strong>
          </div>
          <p className="mt-6 text-xs" style={{ color: "#444" }}>
            <Link href="/login" style={{ color: "#7c3aed" }}>Volver al inicio</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000000" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", boxShadow: "0 0 24px rgba(124,58,237,0.3)" }}
          >
            <span style={{ fontSize: "22px" }}>⚖</span>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#ffffff", fontFamily: "Syne, sans-serif" }}>
            Solicitar acceso
          </h1>
          <p className="text-xs mt-1" style={{ color: "#555" }}>
            Asesor LLA Misiones
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: loading ? "#1a1a1a" : "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
              color: loading ? "#555" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 0 16px rgba(124,58,237,0.3)",
            }}
          >
            {loading ? "Procesando..." : "Solicitar acceso"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs" style={{ color: "#444" }}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" style={{ color: "#7c3aed" }} className="hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
