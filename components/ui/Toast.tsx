"use client";

import { Toaster, toast } from "react-hot-toast";

export { toast };

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface-3)",
          color: "var(--text-primary)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "12px",
          fontSize: "0.875rem",
          fontFamily: "DM Sans, sans-serif",
        },
        success: {
          iconTheme: { primary: "#22C55E", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#EF4444", secondary: "#fff" },
        },
      }}
    />
  );
}

export function useToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast(msg, { icon: "ℹ️" }),
    warning: (msg: string) => toast(msg, { icon: "⚠️" }),
  };
}
