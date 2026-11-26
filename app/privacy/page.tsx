import type { Metadata } from "next"
import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { GITHUB_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy | LinkNest",
  description: "What LinkNest stores, what it counts, and what it never does with your data.",
}

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we store",
    body: "Only what you give us: your email, username, display name and photo, your page and its blocks, and the answers visitors send through your forms, so we can show your page and hand those answers to you.",
  },
  {
    title: "What we count",
    body: "Page views and taps on each block, with the page they belong to, the time, and the referring site if the browser sends one. Nothing that identifies a visitor. No third-party analytics, no tracking pixels.",
  },
  {
    title: "Cookies",
    body: "Two, both needed for the site to work: your sign-in cookie while you use the dashboard, and, on a password-protected page, a cookie that remembers for 12 hours that a visitor entered the right password. Neither is used for tracking.",
  },
  {
    title: "Who we share it with",
    body: "Nobody. We do not sell, rent or share your data, and form answers are never used for advertising or training.",
  },
  {
    title: "Where it lives",
    body: "Pages and accounts are stored in MongoDB Atlas, photos on Cloudinary, and the site runs on Vercel.",
  },
  {
    title: "Deleting your data",
    body: (
      <>
        Delete your account from Settings, in the Danger zone: your page, blocks, stats and form answers go with it. For an export
        or any other request, open an issue on{" "}
        <a href={GITHUB_URL} className="landing-link font-semibold text-pink-ink underline decoration-1 underline-offset-4 hover:decoration-2">
          the LinkNest repository on GitHub
        </a>
        .
      </>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto w-full max-w-[1080px] px-5 pt-4 sm:px-8 sm:pt-6">
        <Wordmark />
      </header>
      <main className="mx-auto w-full max-w-[1080px] px-5 pt-16 pb-32 sm:px-8 lg:pt-24">
        <h1 className="type-title-1">Privacy</h1>
        <p className="type-body mt-4 max-w-[56ch] text-lg text-ink-soft">
          LinkNest is free and open source. It keeps what it needs to show your page, and nothing to sell.
        </p>
        <p className="type-small mt-4 text-ink-soft">Last updated November 2026.</p>

        <dl className="mt-16 max-w-[820px]">
          {sections.map((s) => (
            <div key={s.title} className="grid gap-2 border-t border-rule py-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
              <dt className="type-title-3">{s.title}</dt>
              <dd className="type-body max-w-[60ch]">{s.body}</dd>
            </div>
          ))}
        </dl>

        <p className="type-small mt-8">
          <Link href="/" className="landing-link inline-flex min-h-11 items-center font-semibold text-ink">
            Back to LinkNest
          </Link>
        </p>
      </main>
    </div>
  )
}
