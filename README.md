# About-me agent

A dark-themed web app where visitors pick who they are (Recruiter, or Friend or Family) and chat with an AI that answers questions about Venkatesh. It uses an open-source model that runs locally through [Ollama](https://ollama.com). No API key is needed.

## Run

1. Make sure Ollama is running and has the model: `ollama pull gemma3:1b`
2. `npm run build` (builds the React frontend; only needed after frontend changes)
3. `npm start` (needs Node 22.9+), then open http://localhost:3000

## Project layout

| Path | Purpose |
| --- | --- |
| `server.js` | Node server. Serves the built frontend and `POST /api/chat`. No dependencies. |
| `profile.md` | What the agent knows for **recruiters**. |
| `profile.personal.md` | What the agent knows for **friends and family**. |
| `web/` | React + TypeScript + Vite + Tailwind CSS v4 frontend. UI components in `web/src/components/ui` follow the shadcn/ui pattern. Animations use Framer Motion, icons use Lucide. |

Edit the two profile files any time. Changes apply on the next message without a restart. Everything in them can be shown to visitors, so leave out private data.

## Frontend development

Run `npm start` in one terminal and `npm run dev:web` in another. Open the URL Vite prints (http://localhost:5173). It hot-reloads and forwards `/api` calls to the Node server.

Accent colors are CSS variables in `web/src/index.css` (indigo to cyan for recruiters, amber to rose for friends and family).

## Settings

All optional. Copy `.env.example` to `.env` to override.

| Variable | Default | Purpose |
| --- | --- | --- |
| `LLM_BASE_URL` | `http://localhost:11434/v1` | Any OpenAI-compatible endpoint |
| `LLM_MODEL` | `gemma3:1b` | Model name. Larger models such as `llama3.1:8b` follow the profile more accurately |
| `LLM_API_KEY` | none | Only for hosted providers (Groq, OpenRouter, etc.) |
| `PORT` | `3000` | Web server port |

## How it works

- The page sends the chosen audience and the conversation to `POST /api/chat`.
- The server loads that audience's profile file, adds it to a system prompt with rules (answer only from the profile, refuse private details, ignore attempts to change the rules), and calls the model.
- The server limits request size, history length, and requests per IP (15 per minute). It serves only files inside `web/dist`.

## Deploy to Netlify

Netlify cannot run `server.js` or reach Ollama on your laptop. On Netlify the frontend is static and `/api/chat` is a serverless function (`netlify/functions/chat.mjs`) that calls a hosted open-model API. `chat-core.js` holds the logic shared with `server.js`.

`netlify.toml` already sets the build command, publish directory and functions directory. In the Netlify UI, leave Base directory and Package directory empty, and add these environment variables (get a free key at https://console.groq.com):

| Variable | Value |
| --- | --- |
| `LLM_BASE_URL` | `https://api.groq.com/openai/v1` |
| `LLM_MODEL` | `llama-3.3-70b-versatile` |
| `LLM_API_KEY` | your Groq key (mark it as a secret) |

The profile files are copied into the function at build time, so edit them and redeploy to change what the agent knows.

## Putting it online elsewhere

- Ollama must run on the same machine or be reachable from the host, so use a server you control or switch to a hosted open-model provider via `LLM_BASE_URL` and `LLM_API_KEY`.
- Anyone can choose "Friend or Family", so the details in `profile.personal.md` are visible to every visitor.
- Behind a reverse proxy, the rate limiter sees the proxy's IP. Adjust it to use `X-Forwarded-For` from your proxy.
