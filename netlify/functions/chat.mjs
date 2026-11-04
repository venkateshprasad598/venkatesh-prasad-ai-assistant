// Netlify Function that serves POST /api/chat in production.
// Profiles are embedded at build time by scripts/embed-profiles.mjs.
import { PROFILES } from "../generated/profiles.js";
import {
  MAX_BODY_BYTES,
  buildSystemPrompt,
  createRateLimiter,
  describeFailure,
  generateReply,
  isAudience,
  sanitizeMessages,
} from "../../chat-core.js";

export const config = { path: "/api/chat", method: "POST" };

const isRateLimited = createRateLimiter({ windowMs: 60_000, max: 15 }); // per IP, per warm instance

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "X-Content-Type-Options": "nosniff" },
  });
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  if (isRateLimited(context?.ip || "unknown")) {
    return json(429, { error: "Too many requests. Please wait a minute and try again." });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: "Request too large" });

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const messages = sanitizeMessages(payload?.messages);
  if (!messages) return json(400, { error: "Invalid messages" });
  const audience = payload?.audience;
  if (!isAudience(audience)) return json(400, { error: "Invalid audience" });

  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL;
  if (!apiKey || !baseUrl || !model) {
    console.error("Missing LLM_API_KEY, LLM_BASE_URL or LLM_MODEL environment variable");
    return json(500, { error: "The assistant is not configured yet." });
  }

  try {
    const reply = await generateReply({
      baseUrl,
      model,
      apiKey,
      systemPrompt: buildSystemPrompt(audience, PROFILES[audience]),
      messages,
      timeoutMs: 20_000,
    });
    return json(200, { reply });
  } catch (err) {
    console.error("Chat failure:", err.message);
    return json(502, { error: `The assistant is unavailable right now (${describeFailure(err)}).` });
  }
};
