import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * An address nobody has claimed (DESIGN_SYSTEM.md §8.8). A blank sheet off the press: the
 * page is paper, the only print on it is a pink halftone and the way out.
 */
export default function UserNotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-paper text-ink">
      <span aria-hidden="true" className="ln-404-dots pointer-events-none absolute -top-16 -right-24 -z-10 aspect-square w-[min(110vw,640px)] bg-pink opacity-80" />
      <header className="mx-auto w-full max-w-[1080px] px-5 pt-4 sm:px-8 sm:pt-6">
        <Wordmark />
      </header>
      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col justify-center px-5 pb-24 sm:px-8">
        <p className="type-small font-semibold text-ink-soft">Page not found</p>
        <h1 className="type-title-1 mt-3 max-w-[14ch] text-[length:clamp(2.5rem,8vw,5rem)] leading-[0.95]">Nobody has printed this page yet.</h1>
        <p className="type-body mt-6 max-w-[46ch] text-lg">
          Check the address for a typo. If it is right, the name is still free, and it could be yours.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/auth/signup" className={cn(buttonVariants({ variant: "pink", size: "touch" }), "px-5")}>
            Claim a name
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "touch" }), "border-ink px-5")}>
            See what LinkNest is
          </Link>
        </div>
      </main>
    </div>
  )
}
