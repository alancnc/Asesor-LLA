"use client";

const SUGGESTIONS = [
  "¿Es constitucional la ley de financiamiento universitario?",
  "¿Qué dice la Constitución sobre el Banco Central?",
  "¿Cómo se implementaría la dolarización legalmente?",
  "¿Qué ministerios puede eliminar el Ejecutivo por decreto?",
  "Analizá el proyecto de ley de reforma laboral",
  "¿Cuáles son los límites constitucionales del DNU?",
];

export default function SuggestedQuestions({
  onSelect,
}: {
  onSelect: (q: string) => void;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6">
      <p
        className="text-xs text-center mb-3 tracking-widest uppercase"
        style={{ color: "#444444", letterSpacing: "0.15em" }}
      >
        Consultas frecuentes
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 cursor-pointer"
            style={{
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              color: "#888888",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(124, 58, 237, 0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(124, 58, 237, 0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#1a1a1a";
              (e.currentTarget as HTMLButtonElement).style.color = "#888888";
              (e.currentTarget as HTMLButtonElement).style.background =
                "#0a0a0a";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
