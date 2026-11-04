import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AudienceId } from "@/lib/audiences";
import { Landing } from "@/components/Landing";
import { Chat } from "@/components/Chat";

export default function App() {
  const [audience, setAudience] = useState<AudienceId | null>(null);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={audience ?? "landing"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {audience ? (
          <Chat audienceId={audience} onBack={() => setAudience(null)} />
        ) : (
          <Landing onSelect={setAudience} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
