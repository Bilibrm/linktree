import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Any LinkNest address that does not exist. Same sheet as an unclaimed name
 * (app/[username]/not-found.tsx): paper, one pink halftone, and the ways out.
 */
export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-paper text-ink">
      <span aria-hidden="true" className="ln-404-dots pointer-events-none absolute -top-16 -right-24 -z-10 aspect-square w-[min(110vw,640px)] bg-pink opacity-80" />
      <header className="mx-auto w-full max-w-[1080px] px-5 pt-4 sm:px-8 sm:pt-6">
        <Wordmark />
      </header>
      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col justify-center px-5 pb-24 sm:px-8">
        <p className="type-small font-semibold text-ink-soft">Page not found</p>
        <h1 className="type-title-1 mt-3 max-w-[14ch] text-[length:clamp(2.5rem,8vw,5rem)] leading-[0.95]">This sheet is not in the press.</h1>
        <p className="type-body mt-6 max-w-[46ch] text-lg">The link may be old or mistyped. Start from the front page, or go to your dashboard.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: "pink", size: "touch" }), "px-5")}>
            Go to the front page
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "touch" }), "border-ink px-5")}>
            Open your dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
