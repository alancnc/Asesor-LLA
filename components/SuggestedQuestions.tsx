"use client";

const DEFAULT_SUGGESTIONS = [
  "¿Es constitucional una ley aprobada sin quórum?",
  "¿Cuál es el procedimiento para declarar de interés provincial un proyecto?",
  "¿Qué diferencia hay entre una declaración y una resolución legislativa?",
  "Analizá este proyecto de ley y recomendá cómo votar",
  "¿Cuáles son los límites constitucionales del Ejecutivo provincial?",
  "¿Cómo se interpela a un ministro provincial en Misiones?",
];

interface SuggestedQuestionsProps {
  onSelect: (q: string) => void;
  questions?: string[];
}

export default function SuggestedQuestions({ onSelect, questions }: SuggestedQuestionsProps) {
  const items = questions ?? DEFAULT_SUGGESTIONS;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6">
      <p
        className="text-xs text-center mb-4 uppercase tracking-widest"
        style={{ color: "var(--text-secondary)", letterSpacing: "0.15em", fontFamily: "DM Sans, sans-serif" }}
      >
        Consultas frecuentes
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-left rounded-xl cursor-pointer transition-all duration-200"
            style={{
              padding: "12px 16px",
              background: "rgba(124,58,237,0.04)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              lineHeight: "1.5",
              fontFamily: "DM Sans, sans-serif",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(124,58,237,0.1)";
              el.style.borderColor = "rgba(124,58,237,0.5)";
              el.style.color = "#c4b5fd";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(124,58,237,0.04)";
              el.style.borderColor = "rgba(124,58,237,0.2)";
              el.style.color = "var(--text-secondary)";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
