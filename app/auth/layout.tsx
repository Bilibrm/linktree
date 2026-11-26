import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="mx-auto w-full max-w-6xl px-5 pt-4 sm:px-8 sm:pt-6">
        <Wordmark />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pt-10 pb-16 sm:px-8 sm:pt-16">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-6xl px-5 pb-6 sm:px-8">
        <p className="type-small text-ink-soft">
          Free and open source.{" "}
          <Link href="/privacy" className="inline-flex min-h-11 items-center text-ink underline underline-offset-4">
            Privacy
          </Link>
        </p>
      </footer>
    </div>
  )
}
