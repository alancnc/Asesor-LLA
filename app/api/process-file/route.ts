import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_CHARS = 100_000;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large" }, { status: 413 });

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";

    if (name.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const data = await PDFParse(buf);
      text = data.text;
    } else if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value;
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buf, { type: "buffer" });
      const parts: string[] = [];
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        parts.push(`[Hoja: ${sheetName}]\n${XLSX.utils.sheet_to_csv(ws)}`);
      }
      text = parts.join("\n\n");
    } else {
      // TXT, MD, RTF, JSON, JS, TS, PY, HTML, CSS, PPT, PPTX, etc.
      text = buf.toString("utf-8");
    }

    if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS) + "\n[... contenido truncado ...]";

    return NextResponse.json({ text, fileName: file.name });
  } catch (err) {
    console.error("process-file error:", err);
    return NextResponse.json({ error: "Error procesando el archivo" }, { status: 500 });
  }
}
