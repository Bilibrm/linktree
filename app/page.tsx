import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { BlockShowcase } from "@/components/landing/block-showcase"
import { ClaimForm } from "@/components/landing/claim-form"
import { Hero } from "@/components/landing/hero"
import { LandingMotion } from "@/components/landing/landing-motion"
import { TapsSection } from "@/components/landing/taps-section"
import { ThemeShowcase } from "@/components/landing/theme-showcase"
import { buttonVariants } from "@/components/ui/button"
import { GITHUB_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

const footerLink = "landing-link inline-flex min-h-11 items-center text-ink"

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <div className="relative">
        <header className="landing-wrap relative flex items-center justify-between gap-4 pt-4 sm:pt-6">
          <Wordmark />
          <nav aria-label="Account" className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login" className="landing-link type-small inline-flex min-h-11 items-center px-2 font-semibold text-ink">
              Log in
            </Link>
            <Link href="/auth/signup" className={cn(buttonVariants({ variant: "outline" }), "hidden h-11 border-ink px-4 sm:inline-flex")}>
              Claim your name
            </Link>
          </nav>
        </header>
      </div>

      <main className="flex-1">
        <Hero />
        <BlockShowcase />
        <ThemeShowcase />
        <TapsSection />

        <section aria-labelledby="close-title" className="landing-section">
          <div className="landing-wrap" data-reveal-group>
            <div data-rule className="landing-rule mb-16" />
            <h2 id="close-title" data-reveal className="type-title-1">
              Free and open source
            </h2>
            <p data-reveal className="type-body mt-6 max-w-[52ch] text-lg text-ink-soft">
              No paid plan and no block locked behind one. The code is public, so you can read it, fork it or run your own.
            </p>
            <div data-reveal className="mt-12">
              <ClaimForm buttonLabel="Claim your name" />
            </div>
          </div>
        </section>
      </main>
      <LandingMotion />

      <footer>
        <div className="landing-wrap type-small flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-rule py-8">
          <p className="text-ink-soft">LinkNest. Free and open source.</p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className={footerLink}>
                Privacy
              </Link>
            </li>
            <li>
              <a href={GITHUB_URL} className={footerLink}>
                Source on GitHub
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  )
}
