# Scira Frontend Demo

A modern Next.js + React AI chat application with model selection, streaming chat, image generation, chat history, speech features, and configurable integrations.

## A4F integration

The application follows the current A4F API shape and keeps the A4F secret server-side.

- Base API: `https://api.a4f.co/v1`
- Server credential: `A4F_API_KEY`
- Optional override: `A4F_BASE_URL`
- Browser requests use same-origin `/api/a4f/*` routes; Vercel serverless functions inject the A4F Bearer token. The static Next export remains compatible with Capacitor (`out/`).
- Supported proxied endpoints include chat completions, Responses, image generation/editing, embeddings, audio speech/transcription, video generation, models, and usage.
- Chat streaming uses `POST /v1/chat/completions` with SSE.
- Model discovery uses `/v1/models` with plan/type filters and extended metadata.
- Image mode is restricted to models whose A4F model type is `images/generations`.

A4F's current authentication documentation says API keys must remain secret and must not be included in client-side code. Configure the key in Vercel/your server environment rather than in browser local storage.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```sh
npm install
```

### Environment

Copy `.env.example` to your deployment/environment configuration and set:

```sh
A4F_API_KEY=your_a4f_key
A4F_BASE_URL=https://api.a4f.co/v1
```

Do not commit real secrets.

### Running the App

```sh
npm run dev
```

Visit `http://localhost:3000`.

### Validation

```sh
npm run typecheck
npm run build
```

CI runs both checks on pushes and pull requests targeting `main`.

## Project Structure

- `app/` — Next.js application pages, API routes, and hooks
- `app/api/a4f/` — secure same-origin A4F proxy
- `components/` — UI and feature components
- `hooks/` — client-side state hooks
- `lib/` — shared types and utilities
- `public/` — static assets
- `styles/` — CSS files

## Other Integrations

Tavily and ElevenLabs keys remain optional browser-managed integrations used by the existing web-search and speech features.

## License

MIT