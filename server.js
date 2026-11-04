import http from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MAX_BODY_BYTES,
  buildSystemPrompt,
  createRateLimiter,
  generateReply,
  isAudience,
  sanitizeMessages,
} from "./chat-core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
// Any OpenAI-compatible API works. Defaults to a local open-source model served by Ollama.
const BASE_URL = (process.env.LLM_BASE_URL || "http://localhost:11434/v1").replace(/\/$/, "");
const MODEL = process.env.LLM_MODEL || "gemma3:1b";
const API_KEY = process.env.LLM_API_KEY || ""; // not needed for Ollama


// The built React app. Only files inside this folder are ever served.
const DIST_DIR = path.join(__dirname, "web", "dist");
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

async function serveStatic(req, res, pathname) {
  if (!existsSync(DIST_DIR)) {
    return sendJson(res, 503, { error: "Frontend not built. Run `npm run build`." });
  }

  let requested;
  try {
    requested = decodeURIComponent(pathname);
  } catch {
    return sendJson(res, 400, { error: "Bad request" });
  }

  // Resolve inside DIST_DIR and reject anything that escapes it (path traversal).
  let filePath = path.resolve(DIST_DIR, "." + (requested === "/" ? "/index.html" : requested));
  if (!filePath.startsWith(DIST_DIR + path.sep)) return sendJson(res, 404, { error: "Not found" });

  let content;
  try {
    content = await readFile(filePath);
  } catch {
    // Paths without a file extension are app routes: fall back to index.html.
    if (path.extname(filePath)) return sendJson(res, 404, { error: "Not found" });
    filePath = path.join(DIST_DIR, "index.html");
    try {
      content = await readFile(filePath);
    } catch {
      return sendJson(res, 404, { error: "Not found" });
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    // Vite fingerprints files in /assets, so they can be cached for a year.
    "Cache-Control": requested.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    ...SECURITY_HEADERS,
  });
  res.end(req.method === "HEAD" ? undefined : content);
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy":
    "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:",
};

// Each audience reads its own profile file.
const PROFILE_FILES = { recruiter: "profile.md", friend: "profile.personal.md" };

// Re-read on every request so profile edits apply without a restart.
async function loadSystemPrompt(audience) {
  const profile = await readFile(path.join(__dirname, PROFILE_FILES[audience]), "utf8");
  return buildSystemPrompt(audience, profile);
}

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 15 }); // per IP

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...SECURITY_HEADERS });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleChat(req, res) {
  const ip = req.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return sendJson(res, 429, { error: "Too many requests. Please wait a minute and try again." });
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (err) {
    return sendJson(res, err.status || 400, { error: err.status ? err.message : "Invalid JSON" });
  }

  const messages = sanitizeMessages(payload?.messages);
  if (!messages) return sendJson(res, 400, { error: "Invalid messages" });
  const audience = payload?.audience;
  if (!isAudience(audience)) return sendJson(res, 400, { error: "Invalid audience" });

  try {
    const reply = await generateReply({
      baseUrl: BASE_URL,
      model: MODEL,
      apiKey: API_KEY,
      systemPrompt: await loadSystemPrompt(audience),
      messages,
      timeoutMs: 120_000, // local models can be slow on first load
    });
    sendJson(res, 200, { reply });
  } catch (err) {
    console.error("Chat failure:", err.message);
    sendJson(res, 502, { error: "The assistant is unavailable right now." });
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");

  if (pathname === "/api/chat") {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
    return handleChat(req, res);
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`About-me agent running at http://localhost:${PORT} (model: ${MODEL} via ${BASE_URL})`);
  if (!existsSync(DIST_DIR)) {
    console.warn("Warning: web/dist not found. Run `npm run build` to build the frontend.");
  }
});
