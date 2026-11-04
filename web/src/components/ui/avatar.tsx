import { cn } from "@/lib/utils";

interface AvatarProps {
  initials?: string;
  className?: string;
}

/** Gradient monogram. Uses the current accent colors. */
export function Avatar({ initials = "VP", className }: AvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-(--accent-from) to-(--accent-to) text-xs font-bold tracking-wide text-white shadow-lg shadow-(--accent-from)/30",
        className,
      )}
    >
      {initials}
    </div>
  );
}
