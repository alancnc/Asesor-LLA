"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SuggestedQuestions from "@/components/SuggestedQuestions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatApp({ userEmail }: { userEmail: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversation(id: string) {
    setConversationId(id);
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (res.ok) {
      const msgs = await res.json();
      setMessages(msgs.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })));
    }
  }

  function handleNewChat() {
    setMessages([]);
    setConversationId(null);
    setInput("");
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isLoading) return;

      let activeConversationId = conversationId;

      // Create conversation on first message
      if (!activeConversationId) {
        const title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
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

      // Save user message to DB
      if (activeConversationId) {
        await fetch(`/api/conversations/${activeConversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content }),
        });
      }

      const userMessage: Message = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      const assistantIndex = updatedMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setStreamingIndex(assistantIndex);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            conversationId: activeConversationId,
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
                      next[assistantIndex] = { role: "assistant", content: accumulated };
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
          };
          return next;
        });
      } finally {
        setIsLoading(false);
        setStreamingIndex(null);
      }
    },
    [input, messages, isLoading, conversationId]
  );

  return (
    <div className="flex h-screen" style={{ background: "#000" }}>
      <Sidebar
        activeId={conversationId}
        onSelect={loadConversation}
        onNew={handleNewChat}
        userEmail={userEmail}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header mobile */}
        <header
          className="flex-shrink-0 flex items-center justify-center py-3 md:hidden"
          style={{ borderBottom: "1px solid #111" }}
        >
          <span className="text-xs font-semibold tracking-widest" style={{ color: "#555", letterSpacing: "0.12em" }}>
            ASESOR LLA
          </span>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pl-16 md:pl-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full pb-8">
              <div className="text-center mb-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
                    boxShadow: "0 0 32px rgba(124,58,237,0.3)",
                  }}
                >
                  <span style={{ fontSize: "32px" }}>⚖</span>
                </div>
                <h2 className="text-2xl font-semibold mb-2" style={{ color: "#fff" }}>
                  Asesor Jurídico LLA
                </h2>
                <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: "#555" }}>
                  Asesoramiento jurídico y político desde los principios de{" "}
                  <span style={{ color: "#7c3aed" }}>La Libertad Avanza</span>.
                </p>
                <div className="flex items-center justify-center gap-4 mt-5">
                  {["Derecho Const.", "Política Pública", "Legislación"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{
                        background: "rgba(124,58,237,0.08)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        color: "#7c3aed",
                        fontSize: "0.7rem",
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
                <ChatMessage key={i} message={msg} isStreaming={i === streamingIndex} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* Input */}
        <footer className="flex-shrink-0 px-4 pb-6 pt-3 pl-16 md:pl-4" style={{ background: "#000" }}>
          <div className="max-w-2xl mx-auto">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={() => sendMessage()}
              isLoading={isLoading}
            />
            <p className="text-center mt-3" style={{ color: "#1f1f1f", fontSize: "0.65rem" }}>
              Asesor LLA · Powered by Claude · Viva la Libertad
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
