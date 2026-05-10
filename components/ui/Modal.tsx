"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  danger?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  danger,
  confirmLabel,
  onConfirm,
  confirmLoading,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md animate-slide-up"
        style={{
          background: "var(--surface-3)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {title && (
            <h2
              className="text-base font-semibold"
              style={{ color: danger ? "#F87171" : "#fff", fontFamily: "Syne, sans-serif" }}
            >
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {onConfirm && (
          <div
            className="flex items-center justify-end gap-2 px-6 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl transition-all"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmLoading}
              className="px-4 py-2 text-sm rounded-xl font-medium transition-all flex items-center gap-2"
              style={{
                background: danger ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg, #7C3AED, #5B21B6)",
                color: danger ? "#F87171" : "#fff",
                border: danger ? "1px solid rgba(239,68,68,0.4)" : "none",
                opacity: confirmLoading ? 0.6 : 1,
                cursor: confirmLoading ? "not-allowed" : "pointer",
              }}
            >
              {confirmLoading && (
                <div className="w-3 h-3 rounded-full border-2 border-current" style={{ borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              )}
              {confirmLabel ?? "Confirmar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
