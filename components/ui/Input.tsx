"use client";

import { InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export default function Input({
  label,
  error,
  success,
  className = "",
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "rgba(239,68,68,0.6)"
    : success
    ? "rgba(34,197,94,0.6)"
    : focused
    ? "rgba(124,58,237,0.5)"
    : "rgba(255,255,255,0.08)";

  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${className}`}
        style={{
          background: "var(--surface-3)",
          border: `1px solid ${borderColor}`,
          color: "var(--text-primary)",
          boxShadow: focused && !error ? "0 0 0 3px rgba(124,58,237,0.1)" : "none",
        }}
      />
      {error && (
        <p className="mt-1 text-xs" style={{ color: "#F87171" }}>
          {error}
        </p>
      )}
    </div>
  );
}
