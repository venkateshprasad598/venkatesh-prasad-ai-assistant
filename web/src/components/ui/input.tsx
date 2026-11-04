import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full min-w-0 bg-transparent px-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
