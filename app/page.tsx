"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isLoading) return;

      const userMessage: Message = { role: "user", content };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      const assistantIndex = updatedMessages.length;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);
      setStreamingIndex(assistantIndex);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
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
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

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
                      };
                      return next;
                    });
                  }
                } catch {
                  // skip malformed chunks
                }
              }
            }
          }
        }
      } catch {
        setMessages((prev) => {
          const next = [...prev];
          next[assistantIndex] = {
            role: "assistant",
            content:
              "Ocurrió un error al procesar tu consulta. Verificá tu conexión e intentá nuevamente.",
          };
          return next;
        });
      } finally {
        setIsLoading(false);
        setStreamingIndex(null);
      }
    },
    [input, messages, isLoading]
  );

  const handleSuggestion = (q: string) => {
    setInput(q);
    sendMessage(q);
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "#000000" }}
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid #111111",
          background: "#000000",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
              boxShadow: "0 0 16px rgba(124, 58, 237, 0.5)",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚖</span>
          </div>
          <div>
            <h1
              className="text-sm font-semibold tracking-wide"
              style={{ color: "#ffffff", letterSpacing: "0.05em" }}
            >
              ASESOR LLA
            </h1>
            <p
              className="text-xs"
              style={{ color: "#555555", fontSize: "0.7rem" }}
            >
              Jurídico · Político · Liberal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
              }}
            />
            <span style={{ color: "#444444", fontSize: "0.7rem" }}>
              En línea
            </span>
          </div>
          {hasMessages && (
            <button
              onClick={clearChat}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                color: "#555555",
                border: "1px solid #1a1a1a",
                background: "transparent",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#888888";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#333333";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#555555";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#1a1a1a";
              }}
            >
              Nueva consulta
            </button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {!hasMessages ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center min-h-full pb-8">
            <div className="text-center mb-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
                  boxShadow: "0 0 32px rgba(124, 58, 237, 0.3)",
                }}
              >
                <span style={{ fontSize: "32px" }}>⚖</span>
              </div>

              <h2
                className="text-2xl font-semibold mb-2 tracking-tight"
                style={{ color: "#ffffff" }}
              >
                Asesor Jurídico LLA
              </h2>
              <p
                className="text-sm max-w-sm mx-auto leading-relaxed"
                style={{ color: "#555555" }}
              >
                Asesoramiento jurídico y político desde los principios de{" "}
                <span style={{ color: "#7c3aed" }}>La Libertad Avanza</span>.
                Consultas constitucionales, legislativas y de política pública.
              </p>

              <div
                className="flex items-center justify-center gap-6 mt-6"
              >
                {["Derecho Const.", "Política Pública", "Legislación"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{
                        background: "rgba(124, 58, 237, 0.08)",
                        border: "1px solid rgba(124, 58, 237, 0.2)",
                        color: "#7c3aed",
                        fontSize: "0.7rem",
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <SuggestedQuestions onSelect={handleSuggestion} />
          </div>
        ) : (
          /* Chat messages */
          <div className="max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={i === streamingIndex}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input area */}
      <footer
        className="flex-shrink-0 px-4 pb-6 pt-3"
        style={{ background: "#000000" }}
      >
        <div className="max-w-2xl mx-auto">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => sendMessage()}
            isLoading={isLoading}
          />
          <p
            className="text-center mt-3"
            style={{ color: "#2a2a2a", fontSize: "0.65rem" }}
          >
            Asesor LLA · Powered by Claude · Viva la Libertad
          </p>
        </div>
      </footer>
    </div>
  );
}
