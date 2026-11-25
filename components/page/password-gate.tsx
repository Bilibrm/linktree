"use client"

import { useId, useState } from "react"
import { Lock } from "lucide-react"
import { verifyPagePassword } from "@/lib/actions/page"
import type { ThemeRootProps } from "@/lib/themes/render"

/**
 * Client island for a password-protected page: the lock screen, drawn in the owner's
 * theme, until the visitor enters the password. `children` is the server-rendered page.
 */
export function PasswordGate({
  pageId,
  name,
  root,
  children,
}: {
  pageId: string
  name: string
  /** The owner's theme on the page root, from `themeRootProps`. */
  root: ThemeRootProps
  children: React.ReactNode
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(false)
  const id = useId()

  if (unlocked) return children

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setChecking(true)
    setError("")
    try {
      const result = await verifyPagePassword(pageId, password)
      if (result.ok) setUnlocked(true)
      else setError("That password is not right. Check it with the person who shared the page.")
    } catch {
      setError("The password could not be checked. Try again in a moment.")
    }
    setChecking(false)
  }

  return (
    <div {...root.attrs} className="lp lp-page" style={root.style as React.CSSProperties}>
      <div className="lp-bg" aria-hidden="true">
        <span className="lp-art lp-art-a" />
        <span className="lp-art lp-art-b" />
      </div>
      <main className="lp-lock">
      <span className="lp-lock-mark" aria-hidden="true">
        <Lock className="size-7" strokeWidth={1.75} />
      </span>
      <div>
        <h1 className="lp-heading lp-h1">{name}&rsquo;s page is locked</h1>
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
