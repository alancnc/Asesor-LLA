# Asesor LLA — Asesor Jurídico & Político

Chatbot de asesoramiento jurídico y político para **La Libertad Avanza**, impulsado por la API de Claude (Anthropic). Diseño minimalista negro y violeta.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Anthropic SDK** — Claude claude-opus-4-7 con streaming SSE

## Configuración

### 1. Variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` y agregá tu API key de Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Obtenés tu key en: https://console.anthropic.com/

### 2. Instalar dependencias

```bash
npm install
```

### 3. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el browser.

## Estructura

```
app/
  api/chat/route.ts   # API route con streaming hacia Claude
  page.tsx            # UI principal del chatbot
  layout.tsx          # Layout y metadata
  globals.css         # Estilos globales (negro/violeta)
components/
  ChatMessage.tsx     # Burbuja de mensaje con markdown
  ChatInput.tsx       # Input con auto-resize y envío
  SuggestedQuestions  # Preguntas sugeridas en pantalla inicio
```

## Deploy en Vercel

1. Pusheá el repo a GitHub
2. Importá en [vercel.com](https://vercel.com)
3. Agregá la variable de entorno `ANTHROPIC_API_KEY` en Settings → Environment Variables
4. Deploy

---

*Viva la Libertad, carajo.*
