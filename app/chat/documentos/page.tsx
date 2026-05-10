"use client";

import { useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface DocFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  text: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📕";
  if (ext === "docx" || ext === "doc") return "📘";
  if (ext === "txt") return "📄";
  return "📎";
}

export default function DocumentosPage() {
  const router = useRouter();
  const toast = useToast();
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<DocFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no puede superar 10MB");
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(40);
      const res = await fetch("/api/upload-doc", { method: "POST", body: formData });
      setUploadProgress(80);

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Error al procesar el archivo");
        return;
      }

      const { text, fileName } = await res.json();
      setUploadProgress(100);

      setDocs((prev) => [
        {
          name: fileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          text,
        },
        ...prev,
      ]);
      toast.success(`${fileName} cargado correctamente`);
    } catch {
      toast.error("Error al subir el archivo");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 600);
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function handleAnalyze(doc: DocFile) {
    // Store doc text in sessionStorage and navigate to chat
    sessionStorage.setItem("preloadedDoc", JSON.stringify({ name: doc.name, text: doc.text }));
    router.push("/chat");
    toast.info(`Abriendo "${doc.name}" en el chat...`);
  }

  function handleDelete(doc: DocFile) {
    setDocs((prev) => prev.filter((d) => d !== doc));
    setDeleteDoc(null);
    toast.success("Documento eliminado");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#fff", fontFamily: "Syne, sans-serif" }}>
              Documentos
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {docs.length} documento{docs.length !== 1 ? "s" : ""} cargado{docs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
            + Subir documento
          </Button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="w-full rounded-2xl flex flex-col items-center justify-center py-12 mb-8 cursor-pointer transition-all duration-200"
          style={{
            border: `2px dashed ${dragging ? "#7C3AED" : "rgba(124,58,237,0.25)"}`,
            background: dragging ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.03)",
          }}
        >
          {uploading ? (
            <div className="w-full max-w-xs">
              <p className="text-sm text-center mb-3" style={{ color: "#A78BFA" }}>
                Procesando documento...
              </p>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--surface-4)" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg, #7C3AED, #A78BFA)" }}
                />
              </div>
            </div>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>
                Arrastrá o hacé clic para subir
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                PDF, DOC, DOCX, TXT · Máx. 10MB
              </p>
            </>
          )}
        </div>

        {/* Docs grid */}
        {docs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Tus documentos aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docs.map((doc, i) => (
              <div
                key={i}
                className="group rounded-xl p-4 flex flex-col gap-3 transition-all"
                style={{
                  background: "var(--surface-3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: "28px", lineHeight: 1 }}>{fileIcon(doc.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#fff" }}>
                      {doc.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {formatSize(doc.size)} · {format(doc.uploadedAt, "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze(doc)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      color: "#A78BFA",
                    }}
                  >
                    Analizar con IA
                  </button>
                  <button
                    onClick={() => setDeleteDoc(doc)}
                    className="px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#F87171",
                    }}
                    title="Eliminar"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
      />

      {/* Delete modal */}
      <Modal
        open={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        title="Eliminar documento"
        danger
        confirmLabel="Eliminar"
        onConfirm={() => deleteDoc && handleDelete(deleteDoc)}
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          ¿Eliminar <strong style={{ color: "#fff" }}>{deleteDoc?.name}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
