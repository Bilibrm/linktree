"use client"

import { useEffect, useId, useState } from "react"
import { Lock } from "lucide-react"
import { openUnlockedPage, unlockPage } from "@/lib/actions/unlock"
import { themeRootProps, type ResolvedTheme } from "@/lib/themes"
import type { IBlock } from "@/types"
import { MadeWithLinkNest, ThemedPage, type PageHeader } from "./themed-page"
import { PageBeacon } from "./page-beacon"

/**
 * The lock screen of a password-protected page, drawn in the owner's theme. The server
 * sends no blocks with it: they arrive from `unlockPage` once the password is right, or
 * from `openUnlockedPage` when this visitor already holds the page's unlock cookie.
 */
export function PasswordGate({ pageId, theme, header }: { pageId: string; theme: ResolvedTheme; header: PageHeader }) {
  const [blocks, setBlocks] = useState<IBlock[] | null>(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)
  const id = useId()
  const root = themeRootProps(theme)

  // A returning visitor with a valid cookie skips the form.
  useEffect(() => {
    let live = true
    openUnlockedPage(pageId)
      .then((result) => {
        if (live && result.ok) setBlocks(result.blocks)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [pageId])

  if (blocks) {
    return (
      <>
        <PageBeacon pageId={pageId} />
        <ThemedPage theme={theme} header={header} blocks={blocks} page footer={<MadeWithLinkNest />} />
      </>
    )
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setChecking(true)
    setError("")
    try {
      const result = await unlockPage(pageId, password)
      if (result.ok) setBlocks(result.blocks)
      else if (result.reason === "wait")
        setError(`That password is not right. Too many tries: wait ${result.waitSeconds ?? 1} seconds before the next one.`)
      else if (result.reason === "locked") setError("This page cannot be opened right now. Reload and try again.")
      else setError("That password is not right. Check it with the person who shared the page.")
    } catch {
      setError("The password could not be checked. Try again in a moment.")
    }
    setChecking(false)
  }

  return (
    <div {...root.attrs} className="lp lp-page ln-page ln-page--locked" style={root.style as React.CSSProperties}>
      <div className="lp-bg" aria-hidden="true">
        <span className="lp-art lp-art-a" />
        <span className="lp-art lp-art-b" />
      </div>
      <main className="lp-lock">
        <span className="lp-lock-mark" aria-hidden="true">
          <Lock className="size-7" strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="lp-heading lp-h1">{header.name}&rsquo;s page is locked</h1>
          <p className="lp-bio">Enter the password you were given to see it.</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor={id} className="lp-label">
            Password
          </label>
          <input
            id={id}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="lp-input"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            required
          />
          <button type="submit" className="lp-btn" data-variant="primary" disabled={checking || !password}>
            {checking ? "Checking" : "Open the page"}
          </button>
          {error && (
            <p id={`${id}-error`} className="lp-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </main>
    </div>
  )
}
