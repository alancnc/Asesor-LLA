"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#000000" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
              boxShadow: "0 0 24px rgba(124, 58, 237, 0.3)",
            }}
          >
            <span style={{ fontSize: "22px" }}>⚖</span>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#ffffff" }}>
            Crear cuenta
          </h1>
          <p className="text-xs mt-1" style={{ color: "#555555" }}>
            Asesor LLA — Jurídico & Político
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              color: "#ffffff",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")
            }
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              color: "#ffffff",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")
            }
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              color: "#ffffff",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)")
            }
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
          />

          {error && (
            <p
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                color: "#f87171",
                background: "rgba(248, 113, 113, 0.08)",
                border: "1px solid rgba(248, 113, 113, 0.2)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: loading
                ? "#1a1a1a"
                : "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
              color: loading ? "#555555" : "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 0 16px rgba(124,58,237,0.3)",
            }}
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs" style={{ color: "#444444" }}>
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            style={{ color: "#7c3aed" }}
            className="hover:underline"
          >
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
