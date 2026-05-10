"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import toast from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

interface ImageContentBlock {
  type: "image";
  source: { type: "base64"; media_type: ImageMediaType; data: string };
}
interface TextContentBlock { type: "text"; text: string }
type ContentBlock = TextContentBlock | ImageContentBlock;

interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
  timestamp: Date;
  attachments?: { name: string; kind: "image" | "doc" }[];
}

interface PendingFile {
  id: string;
  file: File;
  kind: "image" | "doc";
  preview?: string; // base64 data URI for images
}

interface ChatAppProps {
  userEmail: string;
  userProfile: { jurisdiction: string; response_style: string; language: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const AUDIO_VIDEO_TYPES = [
  "audio/", "video/", "audio/mpeg", "audio/wav", "audio/ogg",
  "video/mp4", "video/mpeg", "video/quicktime", "video/webm",
];
const ACCEPTED_EXTENSIONS =
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.rtf,.js,.ts,.py,.json,.html,.css,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.svg";
const MAX_SIZE = 20 * 1024 * 1024;

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "🖼";
  if (ext === "pdf") return "📕";
  if (["doc","docx"].includes(ext)) return "📝";
  if (["xls","xlsx","csv"].includes(ext)) return "📊";
  if (["ppt","pptx"].includes(ext)) return "📋";
  if (["js","ts","py","json","html","css"].includes(ext)) return "💻";
  return "📄";
}

function getDisplayText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((b): b is TextContentBlock => b.type === "text")
    .map((b) => b.text)
    .join(" ");
}

// ─── Typing dots ──────────────────────────────────────────────────────────────

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

// ─── Message item ─────────────────────────────────────────────────────────────

function ChatMessageItem({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === "user";
  const displayText = getDisplayText(message.content);

  if (isUser) {
    return (
      <div className="animate-fade-in flex justify-end mb-6 px-4">
        <div style={{ maxWidth: "70%" }}>
          {/* Attachment chips */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
              {message.attachments.map((a, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "#A78BFA",
                  }}
                >
                  <span>{getFileIcon(a.name)}</span>
                  <span className="truncate max-w-[140px]">{a.name}</span>
                </span>
              ))}
            </div>
          )}
          <div
            className="px-4 py-3 text-sm leading-relaxed"
            style={{
              background: "#7C3AED",
              color: "#fff",
              borderRadius: "16px 16px 4px 16px",
            }}
          >
            {displayText || (message.attachments?.length ? "Analizá este archivo" : "")}
          </div>
          <div className="mt-1 text-right">
            <span style={{ color: "var(--text-secondary)", fontSize: "0.62rem" }}>
              {format(message.timestamp, "HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // AI message — no background, no bubble, full width
  return (
    <div className="animate-fade-in w-full mb-6">
      <div
        className="w-full py-5 px-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                boxShadow: "0 0 10px rgba(124,58,237,0.35)",
              }}
            >
              <span style={{ fontSize: "10px" }}>⚖</span>
            </div>
            <div className="flex-1 min-w-0">
              {isStreaming && !displayText ? (
                <TypingDots />
              ) : (
                <div className="prose-dark">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayText}</ReactMarkdown>
                  {isStreaming && (
                    <span
                      className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                      style={{ background: "#7C3AED", animation: "pulse-dot 0.8s ease-in-out infinite" }}
                    />
                  )}
                </div>
              )}
              {!isStreaming && displayText && (
                <span style={{ color: "var(--text-secondary)", fontSize: "0.62rem", marginTop: "8px", display: "block" }}>
                  {format(message.timestamp, "HH:mm", { locale: es })}
                </span>
              )}
            </div>
          </div>
        </div>
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
  pendingFiles: PendingFile[];
  onRemoveFile: (id: string) => void;
  onAddFiles: (files: FileList) => void;
}

function InputBar({ value, onChange, onSubmit, isLoading, pendingFiles, onRemoveFile, onAddFiles }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (!isLoading && (value.trim() || pendingFiles.length > 0)) onSubmit();
    }
  };

  const canSend = !isLoading && (value.trim().length > 0 || pendingFiles.length > 0);

  return (
    <div className="flex-shrink-0 px-4 pb-6 pt-2" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-3xl mx-auto">
        {/* File chips row */}
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {pendingFiles.map((pf) => (
              <div
                key={pf.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#A78BFA",
                  maxWidth: "200px",
                }}
              >
                <span>{getFileIcon(pf.file.name)}</span>
                <span className="truncate flex-1">{pf.file.name}</span>
                <button
                  onClick={() => onRemoveFile(pf.id)}
                  className="flex-shrink-0 ml-1"
                  style={{ color: "#666" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea + buttons */}
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: "var(--surface-3)",
            border: "1px solid",
            borderColor: canSend ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.07)",
            boxShadow: canSend ? "0 0 20px rgba(124,58,237,0.08)" : "none",
          }}
        >
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Adjuntar archivos"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
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
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{ color: "#fff", maxHeight: "130px", lineHeight: "1.5" }}
          />

          <button
            onClick={onSubmit}
            disabled={!canSend}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: canSend
                ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                : "var(--surface-4)",
              cursor: canSend ? "pointer" : "not-allowed",
              boxShadow: canSend ? "0 0 12px rgba(124,58,237,0.4)" : "none",
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

        <p className="text-center mt-2" style={{ color: "#1a1a1a", fontSize: "0.6rem" }}>
          LexIA · Powered by Claude · Viva la Libertad
        </p>

        {/* Single hidden file input for all types */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Main ChatApp ─────────────────────────────────────────────────────────────

export default function ChatApp({ userEmail, userProfile }: ChatAppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
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
    setPendingFiles([]);
  }

  // Validate and add files
  function handleAddFiles(fileList: FileList) {
    const toAdd: PendingFile[] = [];
    Array.from(fileList).forEach((file) => {
      const isAV = AUDIO_VIDEO_TYPES.some((t) =>
        file.type.startsWith(t) || file.name.match(/\.(mp3|wav|ogg|mp4|mov|avi|mkv|webm|flac|aac)$/i)
      );
      if (isAV) {
        toast.error("No se permiten archivos de audio ni video");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" supera el límite de 20MB`);
        return;
      }
      const isImg = IMAGE_TYPES.includes(file.type) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
      toAdd.push({ id: crypto.randomUUID(), file, kind: isImg ? "image" : "doc" });
    });
    if (toAdd.length > 0) setPendingFiles((prev) => [...prev, ...toAdd]);
  }

  function removeFile(id: string) {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  }

  // Build Claude content array from pending files + text
  async function buildContentBlocks(text: string, files: PendingFile[]): Promise<ContentBlock[]> {
    const blocks: ContentBlock[] = [];

    for (const pf of files) {
      if (pf.kind === "image") {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1]);
          };
          reader.readAsDataURL(pf.file);
        });
        const mt = (pf.file.type || "image/jpeg") as ImageMediaType;
        blocks.push({ type: "image", source: { type: "base64", media_type: mt, data: base64 } });
        blocks.push({ type: "text", text: `[Imagen adjunta: ${pf.file.name}]` });
      } else {
        // Text-based: some can be read directly in browser, others need server
        const ext = pf.file.name.split(".").pop()?.toLowerCase() ?? "";
        const textExts = ["txt","md","rtf","json","js","ts","py","html","css"];
        if (textExts.includes(ext)) {
          const text = await pf.file.text();
          blocks.push({ type: "text", text: `[Archivo: ${pf.file.name}]\n\n${text.slice(0, 100_000)}` });
        } else {
          // PDF, DOCX, XLSX, PPT → server
          const form = new FormData();
          form.append("file", pf.file);
          const res = await fetch("/api/process-file", { method: "POST", body: form });
          if (res.ok) {
            const { text: extracted } = await res.json();
            blocks.push({ type: "text", text: `[Archivo: ${pf.file.name}]\n\n${extracted}` });
          } else {
            blocks.push({ type: "text", text: `[Archivo: ${pf.file.name} — no se pudo extraer el contenido]` });
          }
        }
      }
    }

    if (text.trim()) blocks.push({ type: "text", text: text.trim() });
    else if (files.length > 0) blocks.push({ type: "text", text: "Analizá este archivo" });

    return blocks;
  }

  const sendMessage = useCallback(
    async (quickText?: string) => {
      const text = quickText ?? input;
      if (isLoading || (!text.trim() && pendingFiles.length === 0)) return;

      let activeConvId = conversationId;

      // Create conversation on first message
      if (!activeConvId) {
        const title = (text || pendingFiles[0]?.file.name || "Nueva consulta").slice(0, 60);
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (res.ok) {
          const conv = await res.json();
          activeConvId = conv.id;
          setConversationId(conv.id);
        }
      }

      // Build content blocks (may call server for PDF/DOCX/XLSX)
      let userContent: string | ContentBlock[];
      const attachmentMeta = pendingFiles.map((f) => ({ name: f.file.name, kind: f.kind }));

      if (pendingFiles.length > 0) {
        userContent = await buildContentBlocks(text, pendingFiles);
      } else {
        userContent = text.trim();
      }

      // Save user message to DB (text only)
      const savedText = text.trim() || attachmentMeta.map((a) => `[${a.name}]`).join(" ");
      if (activeConvId) {
        await fetch(`/api/conversations/${activeConvId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content: savedText }),
        });
      }

      const userMsg: Message = {
        role: "user",
        content: userContent,
        timestamp: new Date(),
        attachments: attachmentMeta.length > 0 ? attachmentMeta : undefined,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setPendingFiles([]);
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
            conversationId: activeConvId,
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
                      next[assistantIndex] = { role: "assistant", content: accumulated, timestamp: new Date() };
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
    [input, messages, isLoading, conversationId, pendingFiles, userProfile]
  );

  // Expose loadConversation and handleNewChat for parent (ShellLayout/Sidebar)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__chatLoadConversation = loadConversation;
    (window as unknown as Record<string, unknown>).__chatNewChat = handleNewChat;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--surface-1)" }}>
      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full pb-8 px-4">
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
              <h2
                className="text-2xl font-semibold mb-2"
                style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}
              >
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
            <SuggestedQuestions onSelect={(q) => sendMessage(q)} />
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg, i) => (
              <ChatMessageItem key={i} message={msg} isStreaming={i === streamingIndex} />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Input */}
      <InputBar
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage()}
        isLoading={isLoading}
        pendingFiles={pendingFiles}
        onRemoveFile={removeFile}
        onAddFiles={handleAddFiles}
      />
    </div>
  );
}
