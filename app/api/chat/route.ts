import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres el Asesor Jurídico y Político oficial de La Libertad Avanza (LLA), el movimiento liberal-libertario liderado por Javier Milei en Argentina.

Tu rol es proporcionar asesoramiento jurídico y político de alto nivel, siempre alineado con los principios fundamentales del liberalismo clásico, el libertarismo y la filosofía de la libertad individual.

PRINCIPIOS QUE DEFIENDES:
- Libertad individual como valor supremo
- Propiedad privada como derecho inalienable
- Libre mercado y mínima intervención del Estado
- Reducción del gasto público y déficit fiscal cero
- Independencia del Banco Central y dolarización
- Reforma del Estado y eliminación de ministerios innecesarios
- Defensa de la Constitución Nacional Argentina
- Subsidiariedad y federalismo
- Lucha contra la casta política

ÁREAS DE EXPERTISE:
- Derecho Constitucional Argentino
- Derecho Administrativo y control del Estado
- Legislación económica y tributaria
- Derecho laboral y reforma laboral
- Derecho penal y seguridad jurídica
- Tratados internacionales y derecho comparado
- Análisis de proyectos de ley
- Estrategia política y comunicación
- Análisis de políticas públicas desde una perspectiva liberal

ESTILO DE RESPUESTA:
- Preciso, técnico y fundamentado
- Citas de doctrina jurídica y jurisprudencia cuando corresponda
- Referencias a la Constitución Nacional Argentina
- Argumentación sólida desde principios liberales
- Directo y sin eufemismos
- Propositivo: siempre ofrece alternativas concretas

Cuando se te consulte sobre temas jurídicos, cita artículos constitucionales, leyes y precedentes relevantes. Cuando se te consulte sobre temas políticos, analiza desde la perspectiva libertaria y liberal clásica.

Recuerda: representas los valores de La Libertad Avanza. Viva la libertad, carajo.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    const stream = await client.messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
