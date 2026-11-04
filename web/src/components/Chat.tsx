import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, SendHorizontal } from "lucide-react";
import { AUDIENCES, type AudienceId } from "@/lib/audiences";
import { sendChat, type ChatTurn } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, TypingIndicator, type ChatMessage } from "@/components/Message";

interface ChatProps {
  audienceId: AudienceId;
  onBack: () => void;
}

export function Chat({ audienceId, onBack }: ChatProps) {
  const audience = AUDIENCES[audienceId];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: "assistant", content: audience.greeting },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  const nextId = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // Cancel any in-flight request when leaving the chat.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: "user", content: text };
    const history: ChatTurn[] = [...messages, userMsg]
      .filter((m): m is ChatMessage & { role: "user" | "assistant" } => m.role !== "error" && !m.failed)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await sendChat(audienceId, history, controller.signal);
      setMessages((prev) => [...prev, { id: nextId.current++, role: "assistant", content: reply }]);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev.map((m) => (m.id === userMsg.id ? { ...m, failed: true } : m)),
        { id: nextId.current++, role: "error", content: message },
      ]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        inputRef.current?.focus();
      }
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(draft);
  }

  return (
    // data-audience scopes the accent colors for this chat.
    <div data-audience={audienceId} className="relative isolate flex h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-linear-to-br from-(--accent-from) to-(--accent-to) opacity-15 blur-[130px]" />

      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-3 sm:px-5">
        <header className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 px-3 py-2.5 backdrop-blur-xl sm:mt-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} aria-label="Change visitor type">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Switch</span>
            </Button>
            <div className="h-6 w-px bg-border" />
            <Avatar />
            <div className="leading-tight">
              <div className="text-sm font-semibold whitespace-nowrap">Venkatesh's AI</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400" />
                Online
              </div>
            </div>
          </div>
          <Badge variant="accent" className="whitespace-nowrap">
            {audience.chatLabel}
          </Badge>
        </header>

        <div className="scroll-slim flex-1 space-y-4 overflow-y-auto py-6" aria-live="polite">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {!hasUserMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pb-3"
          >
            {audience.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => void ask(s)}
                className="cursor-pointer rounded-full border border-border bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-(--accent-from)/60 hover:bg-(--accent-from)/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}

        <form
          onSubmit={onSubmit}
          autoComplete="off"
          className="mb-3 flex items-center gap-2 rounded-2xl border border-border bg-card/80 p-2 backdrop-blur-xl transition-colors focus-within:border-(--accent-from)/60 sm:mb-5"
        >
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            placeholder="Ask anything..."
            aria-label="Your question"
            disabled={loading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={loading || !draft.trim()} aria-label="Send">
            <SendHorizontal className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
