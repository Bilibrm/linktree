import Link from "next/link"
import { cn } from "@/lib/utils"

/** Two inks crossing: the LinkNest mark. Colors are tokens, the overlap is the overprint. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-6 shrink-0", className)}>
      <circle cx="24" cy="32" r="18" fill="var(--pink)" />
      <circle cx="40" cy="32" r="18" fill="var(--ink)" />
      <path d="M32 15.88A18 18 0 0 1 32 48.12 18 18 0 0 1 32 15.88Z" fill="var(--overprint)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex min-h-11 items-center gap-2 text-ink [font-stretch:115%] text-lg font-extrabold tracking-tight", className)}
    >
      <Mark />
      LinkNest
    </Link>
  )
}
