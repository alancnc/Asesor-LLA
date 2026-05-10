"use client";

import { ReactNode } from "react";

type BadgeVariant = "violet" | "green" | "yellow" | "red" | "gray";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  violet: {
    background: "rgba(124,58,237,0.15)",
    color: "#A78BFA",
    border: "1px solid rgba(124,58,237,0.3)",
  },
  green: {
    background: "rgba(34,197,94,0.1)",
    color: "#4ADE80",
    border: "1px solid rgba(34,197,94,0.25)",
  },
  yellow: {
    background: "rgba(234,179,8,0.1)",
    color: "#FACC15",
    border: "1px solid rgba(234,179,8,0.25)",
  },
  red: {
    background: "rgba(239,68,68,0.1)",
    color: "#F87171",
    border: "1px solid rgba(239,68,68,0.25)",
  },
  gray: {
    background: "rgba(156,163,175,0.1)",
    color: "#9CA3AF",
    border: "1px solid rgba(156,163,175,0.2)",
  },
};

export default function Badge({ children, variant = "violet", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
