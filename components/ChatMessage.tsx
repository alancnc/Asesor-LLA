"use client";

import { useMemo } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w*)\n?([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hupbol]|<pre|<blockquote)(.+)$/gm, (match) => {
      if (match.trim() && !match.startsWith("<")) return `<p>${match}</p>`;
      return match;
    });
}

export default function ChatMessage({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const htmlContent = useMemo(
    () => (isUser ? null : parseMarkdown(message.content)),
    [message.content, isUser]
  );

  return (
    <div
      className={`animate-fade-in flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-1"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
            boxShadow: "0 0 12px rgba(124, 58, 237, 0.4)",
          }}
        >
          <span style={{ fontSize: "12px" }}>⚖</span>
        </div>
      )}

      <div
        className={`max-w-[78%] ${isUser ? "max-w-[65%]" : ""}`}
        style={{ minWidth: "60px" }}
      >
        {isUser ? (
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "#ffffff",
              fontSize: "0.9rem",
            }}
          >
            {message.content}
          </div>
        ) : (
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-sm prose-dark text-sm"
            style={{
              background: "#0f0f0f",
              border: "1px solid #1a1a1a",
              fontSize: "0.9rem",
            }}
          >
            {isStreaming && !message.content ? (
              <div className="flex items-center gap-1 py-1">
                <span
                  className="typing-dot w-1.5 h-1.5 rounded-full"
                  style={{ background: "#7c3aed" }}
                />
                <span
                  className="typing-dot w-1.5 h-1.5 rounded-full"
                  style={{ background: "#7c3aed" }}
                />
                <span
                  className="typing-dot w-1.5 h-1.5 rounded-full"
                  style={{ background: "#7c3aed" }}
                />
              </div>
            ) : (
              <div
                className="prose-dark"
                dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
              />
            )}
            {isStreaming && message.content && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                style={{
                  background: "#7c3aed",
                  animation: "pulse-dot 0.8s ease-in-out infinite",
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
