import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { BlockCatalog } from "@/components/landing/block-catalog"
import { ClaimForm } from "@/components/landing/claim-form"
import { Hero } from "@/components/landing/hero"
import { TapsSection } from "@/components/landing/taps-section"
import { ThemePicker } from "@/components/landing/theme-picker"
import { buttonVariants } from "@/components/ui/button"
import { GITHUB_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

const footerLink = "inline-flex min-h-11 items-center text-ink underline underline-offset-4 decoration-1 hover:decoration-2"

function Section({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 lg:py-40">
        <h2 className="type-title-1">{title}</h2>
        <p className="type-body mt-4 max-w-[52ch] text-lg text-ink-soft">{lead}</p>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <div className="press-grain relative">
        <header className="relative mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 pt-4 sm:px-8 sm:pt-6">
          <Wordmark />
          <nav aria-label="Account" className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login" className="type-small inline-flex min-h-11 items-center px-2 font-semibold text-ink underline-offset-4 hover:underline">
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

        <Section
          title="What you can put on it"
          lead="A page is a stack of blocks. Add the ones you need, drag them into order, hide one for later."
        >
          <BlockCatalog />
          <p className="type-small mt-6 max-w-[52ch] text-ink-soft">
            Also in the box: video, embeds from YouTube, Spotify, SoundCloud and TikTok, dividers and spacers.
          </p>
        </Section>

        <Section
          title="Make it yours"
          lead="Your page should look like your work, not like ours. Try a preset on the sample page."
        >
          <ThemePicker />
        </Section>

        <Section
          title="See who taps"
          lead="LinkNest counts page views and taps on each block. No cookies, no third-party trackers, nothing sold."
        >
          <TapsSection />
        </Section>

        <section className="border-t border-ink">
          <div className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 lg:py-40">
            <h2 className="type-title-1">Free and open source</h2>
            <p className="type-body mt-4 max-w-[52ch] text-lg text-ink-soft">
              No paid plan and no block locked behind one. The code is public, so you can read it, fork it or run your own.
            </p>
            <ClaimForm buttonLabel="Claim your name" className="mt-10" />
          </div>
        </section>
      </main>

      <footer className="border-t border-ink">
        <div className="type-small mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-x-8 gap-y-1 px-5 py-4 sm:px-8">
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
