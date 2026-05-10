"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SuggestedQuestions from "@/components/SuggestedQuestions";

// ─── Types ───────────────────────────────────────────────────────────────────

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

interface ImageContentBlock {
  type: "image";
  source: { type: "base64"; media_type: ImageMediaType; data: string };
}

interface TextContentBlock {
  type: "text";
  text: string;
}

type ContentBlock = TextContentBlock | ImageContentBlock;

interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
  timestamp: Date;
  attachmentName?: string;
  attachmentType?: "image" | "document";
}

interface AttachmentPreview {
  name: string;
  type: "image" | "document";
  // for images: base64 data URI; for documents: extracted text
  data: string;
  mediaType?: ImageMediaType;
}

// ─── Helper: extract text from a message for display ─────────────────────────
function getDisplayText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((b): b is TextContentBlock => b.type === "text")
    .map((b) => b.text)
    .join(" ");
}

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot w-1.5 h-1.5 rounded-full"
          style={{ background: "#7C3AED", animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

// ─── ChatMessage component ────────────────────────────────────────────────────
function ChatMessageItem({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const displayText = getDisplayText(message.content);

  return (
    <div className={`animate-fade-in flex w-full ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-1"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
            boxShadow: "0 0 12px rgba(124,58,237,0.4)",
          }}
        >
          <span style={{ fontSize: "12px" }}>⚖</span>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        {/* Attachment chip */}
        {message.attachmentName && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-1.5"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.25)",
              fontSize: "0.7rem",
              color: "#A78BFA",
            }}
          >
            <span>{message.attachmentType === "image" ? "🖼" : "📄"}</span>
            <span className="truncate max-w-[180px]">{message.attachmentName}</span>
          </div>
        )}

        {/* Bubble */}
        {isUser ? (
          <div
            className="px-4 py-3 text-sm leading-relaxed"
            style={{
              background: "#7C3AED",
              color: "#fff",
              borderRadius: "16px 16px 4px 16px",
            }}
          >
            {displayText}
          </div>
        ) : (
          <div
            className="px-4 py-3 text-sm prose-dark"
            style={{
              background: "var(--surface-3)",
              border: "1px solid rgba(124,58,237,0.12)",
              borderRadius: "16px 16px 16px 4px",
              minWidth: "60px",
            }}
          >
            {isStreaming && !displayText ? (
              <TypingDots />
            ) : (
              <>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayText}
                </ReactMarkdown>
                {isStreaming && (
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                    style={{
                      background: "#7C3AED",
                      animation: "pulse-dot 0.8s ease-in-out infinite",
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span
          className="mt-1 text-xs"
          style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}
        >
          {format(message.timestamp, "HH:mm", { locale: es })}
        </span>
      </div>
    </div>
  );
}

// ─── Input bar ────────────────────────────────────────────────────────────────
interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  attachment: AttachmentPreview | null;
  onAttachmentRemove: () => void;
  onFileAttach: (file: File) => void;
  onImageAttach: (file: File) => void;
}

function InputBar({
  value,
  onChange,
  onSubmit,
  isLoading,
  attachment,
  onAttachmentRemove,
  onFileAttach,
  onImageAttach,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 130) + "px";
    }
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (value.trim() || attachment)) onSubmit();
    }
  };

  return (
    <div className="px-4 pb-6 pt-3" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Attachment preview */}
        {attachment && (
          <div
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <span style={{ fontSize: "14px" }}>
              {attachment.type === "image" ? "🖼" : "📄"}
            </span>
            <span className="flex-1 text-xs truncate" style={{ color: "#A78BFA" }}>
              {attachment.name}
            </span>
            <button
              onClick={onAttachmentRemove}
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Input area */}
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: "var(--surface-3)",
            border: "1px solid",
            borderColor: value || attachment ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.07)",
            boxShadow: value || attachment ? "0 0 20px rgba(124,58,237,0.08)" : "none",
          }}
        >
          {/* File attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Adjuntar documento (PDF, DOC, DOCX, TXT)"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {/* Image attach button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            title="Adjuntar imagen (JPG, PNG, GIF, WEBP)"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Consultá al asesor jurídico..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder-gray-600"
            style={{ color: "#fff", maxHeight: "130px", lineHeight: "1.5" }}
          />

          <button
            onClick={onSubmit}
            disabled={isLoading || (!value.trim() && !attachment)}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background:
                isLoading || (!value.trim() && !attachment)
                  ? "var(--surface-4)"
                  : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              cursor: isLoading || (!value.trim() && !attachment) ? "not-allowed" : "pointer",
              boxShadow:
                !isLoading && (value.trim() || attachment)
                  ? "0 0 12px rgba(124,58,237,0.4)"
                  : "none",
            }}
          >
            {isLoading ? (
              <div
                className="w-3.5 h-3.5 rounded-full border-2"
                style={{ borderColor: "#555", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center mt-2" style={{ color: "#1f1f1f", fontSize: "0.62rem" }}>
          LexIA · Powered by Claude · Viva la Libertad
        </p>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileAttach(file);
            e.target.value = "";
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageAttach(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Main ChatApp ─────────────────────────────────────────────────────────────

interface ChatAppProps {
  userEmail: string;
  userProfile?: { jurisdiction?: string; response_style?: string; language?: string };
}

export default function ChatApp({ userEmail, userProfile }: ChatAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversation(id: string) {
    setConversationId(id);
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (res.ok) {
      const msgs = await res.json();
      setMessages(
        msgs.map((m: { role: string; content: string; created_at: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
    }
  }

  function handleNewChat() {
    setMessages([]);
    setConversationId(null);
    setInput("");
    setAttachment(null);
  }

  // Handle document upload
  async function handleFileAttach(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo no puede superar 10MB");
      return;
    }
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-doc", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Error al procesar el documento");
        return;
      }
      const { text, fileName } = await res.json();
      setAttachment({ name: fileName, type: "document", data: text });
    } catch {
      alert("Error al subir el archivo");
    } finally {
      setUploadingDoc(false);
    }
  }

  // Handle image upload
  async function handleImageAttach(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Extract base64 and media type from data URL
      const [header, base64] = dataUrl.split(",");
      const mediaTypeMatch = header.match(/data:(image\/\w+);base64/);
      const mediaType = (mediaTypeMatch?.[1] ?? "image/jpeg") as ImageMediaType;
      setAttachment({ name: file.name, type: "image", data: base64, mediaType });
    };
    reader.readAsDataURL(file);
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if ((!content && !attachment) || isLoading || uploadingDoc) return;

      let activeConversationId = conversationId;

      // Create conversation on first message
      if (!activeConversationId) {
        const title = (content || attachment?.name || "Nueva consulta").slice(0, 60);
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          const conv = await res.json();
          activeConversationId = conv.id;
          setConversationId(conv.id);
        }
      }

      // Build content blocks for Claude
      let userContent: string | ContentBlock[];
      let savedContent: string;

      if (attachment?.type === "image") {
        const blocks: ContentBlock[] = [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: attachment.mediaType ?? "image/jpeg",
              data: attachment.data,
            },
          },
        ];
        if (content) {
          blocks.push({ type: "text", text: content });
        }
        userContent = blocks;
        savedContent = content || `[Imagen: ${attachment.name}]`;
      } else if (attachment?.type === "document") {
        const docText = `[Documento adjunto: ${attachment.name}]\n\n${attachment.data}`;
        userContent = content
          ? `${docText}\n\n---\nConsulta del usuario: ${content}`
          : docText;
        savedContent = content || `[Documento: ${attachment.name}]`;
      } else {
        userContent = content;
        savedContent = content;
      }

      // Save user message to DB (save text version)
      if (activeConversationId) {
        await fetch(`/api/conversations/${activeConversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content: savedContent }),
        });
      }

      const userMessage: Message = {
        role: "user",
        content: userContent,
        timestamp: new Date(),
        attachmentName: attachment?.name,
        attachmentType: attachment?.type,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setAttachment(null);
      setIsLoading(true);

      const assistantIndex = updatedMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);
      setStreamingIndex(assistantIndex);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            conversationId: activeConversationId,
            userProfile,
          }),
        });

        if (!res.ok) throw new Error("API error");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value, { stream: true }).split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") break;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    accumulated += parsed.text;
                    setMessages((prev) => {
                      const next = [...prev];
                      next[assistantIndex] = {
                        role: "assistant",
                        content: accumulated,
                        timestamp: new Date(),
                      };
                      return next;
                    });
                  }
                } catch { /* skip */ }
              }
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const next = [...prev];
          next[assistantIndex] = {
            role: "assistant",
            content: "Error al procesar la consulta. Verificá tu conexión e intentá nuevamente.",
            timestamp: new Date(),
          };
          return next;
        });
      } finally {
        setIsLoading(false);
        setStreamingIndex(null);
      }
    },
    [input, messages, isLoading, conversationId, attachment, uploadingDoc, userProfile]
  );

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--surface-1)" }}>
      {/* Chat header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
            LexIA — Asesor Jurídico
          </h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {userEmail}
          </p>
        </div>
        <button
          onClick={handleNewChat}
          className="text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "#A78BFA",
          }}
        >
          + Nueva consulta
        </button>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full pb-8">
            <div className="text-center mb-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
                  boxShadow: "0 0 32px rgba(124,58,237,0.3)",
                }}
              >
                <span style={{ fontSize: "32px" }}>⚖</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
                Asesor Jurídico LLA
              </h2>
              <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Asesoramiento jurídico y político desde los principios de{" "}
                <span style={{ color: "#7C3AED" }}>La Libertad Avanza</span>.
              </p>
              <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
                {["Derecho Const.", "Política Pública", "Legislación"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      background: "rgba(124,58,237,0.08)",
                      border: "1px solid rgba(124,58,237,0.2)",
                      color: "#7C3AED",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <SuggestedQuestions onSelect={(q) => { setInput(q); sendMessage(q); }} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessageItem
                key={i}
                message={msg}
                isStreaming={i === streamingIndex}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input bar */}
      {uploadingDoc && (
        <div
          className="text-center py-2 text-xs"
          style={{ color: "#A78BFA", background: "rgba(124,58,237,0.05)" }}
        >
          Procesando documento...
        </div>
      )}
      <InputBar
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage()}
        isLoading={isLoading}
        attachment={attachment}
        onAttachmentRemove={() => setAttachment(null)}
        onFileAttach={handleFileAttach}
        onImageAttach={handleImageAttach}
      />
    </div>
  );
}
