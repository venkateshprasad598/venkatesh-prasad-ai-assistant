import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "error";
  content: string;
  failed?: boolean; // user message that never got an answer; excluded from history
}

// react-markdown does not render raw HTML, so model output cannot inject markup.
const markdownComponents: Components = {
  p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
  ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5 marker:text-muted-foreground">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-2 hover:decoration-cyan-300"
    >
      {children}
    </a>
  ),
};

export function Message({ message }: { message: ChatMessage }) {
  const { role, content } = message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-end gap-3", role === "user" && "justify-end")}
    >
      {role !== "user" && (
        <Avatar className={cn("size-8 rounded-lg text-[10px]", role === "error" && "from-red-500 to-red-400")} />
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed wrap-anywhere",
          role === "user" &&
            "rounded-br-md bg-linear-to-br from-(--accent-from) to-(--accent-to) text-white shadow-lg shadow-(--accent-from)/20",
          role === "assistant" && "rounded-bl-md border border-border bg-card text-zinc-200",
          role === "error" && "flex items-start gap-2 rounded-bl-md border border-red-500/30 bg-red-500/10 text-red-200",
        )}
      >
        {role === "error" && <AlertCircle className="mt-0.5 size-4 shrink-0" />}
        {role === "assistant" ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        ) : (
          <span className="whitespace-pre-wrap">{content}</span>
        )}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-3"
      aria-label="Assistant is typing"
    >
      <Avatar className="size-8 rounded-lg text-[10px]" />
      <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
