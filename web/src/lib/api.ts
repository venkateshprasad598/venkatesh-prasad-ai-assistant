import type { AudienceId } from "./audiences";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function sendChat(
  audience: AudienceId,
  messages: ChatTurn[],
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audience, messages }),
    signal,
  });
  const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
  if (!res.ok || !data.reply) throw new Error(data.error || "Something went wrong. Please try again.");
  return data.reply;
}
