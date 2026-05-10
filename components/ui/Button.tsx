"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 0 16px rgba(124,58,237,0.3)",
  },
  secondary: {
    background: "transparent",
    color: "#A78BFA",
    border: "1px solid rgba(124,58,237,0.4)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  danger: {
    background: "rgba(239,68,68,0.1)",
    color: "#F87171",
    border: "1px solid rgba(239,68,68,0.3)",
  },
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`font-medium transition-all duration-200 flex items-center justify-center gap-2 ${sizeStyles[size]} ${className}`}
      style={{
        ...variantStyles[variant],
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {loading && (
        <div
          className="w-3.5 h-3.5 rounded-full border-2 border-current"
          style={{
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}
