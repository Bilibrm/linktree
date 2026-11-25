"use client"

import { Button } from "@/components/ui/button"

/** A dashboard tab that failed to load. Says what happened and offers the one fix. */
export default function DashboardError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div role="alert" className="mx-auto w-full max-w-4xl px-4 py-16 md:px-8">
      <span className="block h-1 w-10 bg-danger" aria-hidden="true" />
      <h1 className="type-title-2 mt-6">This tab could not be loaded.</h1>
      <p className="type-small mt-2 max-w-[52ch] text-ink-soft">
        Your page and its blocks are safe; only this view failed. Check your connection and try again.
      </p>
      <Button variant="outline" className="mt-6 h-11 border-ink px-4" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </div>
  )
}
