"use client";

import { useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height =
        Math.min(ref.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSubmit();
    }
  };

  return (
    <div
      className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
      style={{
        background: "#0a0a0a",
        border: "1px solid",
        borderColor: value ? "rgba(124, 58, 237, 0.5)" : "#1a1a1a",
        boxShadow: value
          ? "0 0 20px rgba(124, 58, 237, 0.08)"
          : "none",
      }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Consultá al asesor jurídico..."
        rows={1}
        disabled={isLoading}
        className="flex-1 resize-none bg-transparent text-sm outline-none placeholder-gray-600"
        style={{
          color: "#ffffff",
          maxHeight: "160px",
          lineHeight: "1.5",
        }}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !value.trim()}
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background:
            isLoading || !value.trim()
              ? "#1a1a1a"
              : "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
          cursor: isLoading || !value.trim() ? "not-allowed" : "pointer",
          boxShadow:
            !isLoading && value.trim()
              ? "0 0 12px rgba(124, 58, 237, 0.4)"
              : "none",
        }}
      >
        {isLoading ? (
          <div
            className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent"
            style={{
              borderColor: "#444",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
