import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AUDIENCES, type Audience, type AudienceId } from "@/lib/audiences";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const SKILLS = ["React", "TypeScript", "Next.js", "Flutter", "Node.js", "Gen AI"];
const STATS = [
  { value: "5+", label: "Years experience" },
  { value: "1,000+", label: "HNI clients served" },
  { value: "2", label: "Flagship platforms led" },
];

function AudienceCard({ audience, onSelect }: { audience: Audience; onSelect: () => void }) {
  const Icon = audience.icon;
  return (
    // data-audience scopes the accent colors so each card previews its own palette.
    <motion.button
      type="button"
      data-audience={audience.id}
      onClick={onSelect}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-card/70 p-7 text-left backdrop-blur-xl transition-colors hover:border-(--accent-from)/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-linear-to-br from-(--accent-from) to-(--accent-to) opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />

      <div className="relative">
        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-linear-to-br from-(--accent-from) to-(--accent-to) text-white shadow-lg shadow-(--accent-from)/30">
          <Icon className="size-7" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{audience.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{audience.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {audience.highlights.map((h) => (
            <Badge key={h} variant="accent">
              {h}
            </Badge>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground">
          Start chatting
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.button>
  );
}

export function Landing({ onSelect }: { onSelect: (id: AudienceId) => void }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-16">
      {/* Background: grid + soft color glows */}
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/4 -z-10 size-[28rem] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/4 -bottom-32 -z-10 size-[26rem] rounded-full bg-rose-500/15 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 right-10 -z-10 size-72 rounded-full bg-cyan-400/10 blur-[110px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full max-w-3xl flex-col items-center text-center"
      >
        <Badge className="mb-8 border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-3">
          <Sparkles className="size-3.5 text-cyan-300" />
          AI assistant, available 24/7
        </Badge>

        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-[2rem] bg-linear-to-br from-indigo-500 to-cyan-400 opacity-60 blur-xl" />
          <div className="relative grid size-24 place-items-center rounded-[2rem] bg-linear-to-br from-indigo-500 to-cyan-400 text-3xl font-bold text-white ring-1 ring-white/20">
            VP
          </div>
        </div>

        <h1 className="bg-linear-to-b from-white to-zinc-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          Venkatesh Prasad
        </h1>
        <p className="mt-3 text-lg font-medium text-cyan-300">Frontend Engineer &middot; SDE 2 at Niyo</p>
        <p className="mt-1 text-sm text-muted-foreground">Bangalore, India</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SKILLS.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
          Hi, I'm Venkatesh's AI assistant. Tell me who's visiting and I'll tailor the conversation.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2"
      >
        {Object.values(AUDIENCES).map((a) => (
          <AudienceCard key={a.id} audience={a} onSelect={() => onSelect(a.id)} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-3"
      >
        {STATS.map((s) => (
          <Card key={s.label} className="px-3 py-4 text-center">
            <div className="text-2xl font-bold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </motion.div>

      <p className="mt-10 text-center text-xs text-muted-foreground/80">
        Powered by an open-source AI model &middot; answers only from Venkatesh's own profile
      </p>
    </div>
  );
}
