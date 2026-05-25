"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/constants";

type PageState = "form" | "pending" | "rejected";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message === "Invalid login credentials" ? "Email o contraseña incorrectos" : signInError.message);
      setLoading(false);
      return;
    }

    // Admin always passes through
    if (email === ADMIN_EMAIL) {
      router.push("/chat");
      router.refresh();
      return;
    }

    // Check pending_registrations approval
    const res = await fetch("/api/check-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const { status } = await res.json();

    if (status === "approved") {
      router.push("/chat");
      router.refresh();
      return;
    }

    // Not approved — sign out and show message
    await supabase.auth.signOut();
    setLoading(false);
    setPageState(status === "rejected" ? "rejected" : "pending");
  }

  const inputStyle: React.CSSProperties = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    color: "#ffffff",
  };

  if (pageState !== "form") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000" }}>
        <div className="w-full max-w-sm text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: pageState === "rejected" ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" }}
          >
            <span style={{ fontSize: "26px" }}>{pageState === "rejected" ? "🚫" : "⏳"}</span>
          </div>
          <h1 className="text-xl font-semibold mb-3" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            {pageState === "rejected" ? "Acceso denegado" : "Cuenta en revisión"}
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#888" }}>
            {pageState === "rejected"
              ? "Tu solicitud de acceso fue rechazada. Contactate con el administrador para más información."
              : "Tu cuenta aún está pendiente de aprobación. El administrador revisará tu solicitud y te dará acceso próximamente."}
          </p>
          <button
            onClick={() => setPageState("form")}
            className="text-sm"
            style={{ color: "#7c3aed" }}
          >
            ← Volver
          </button>
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
            Asesor LLA
          </h1>
          <p className="text-xs mt-1" style={{ color: "#555" }}>
            Jurídico · Político · Liberal
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
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs" style={{ color: "#444" }}>
          ¿No tenés cuenta?{" "}
          <Link href="/register" style={{ color: "#7c3aed" }} className="hover:underline">Solicitar acceso</Link>
        </p>
      </div>
    </div>
  );
}
