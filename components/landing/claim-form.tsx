"use client"

import { useId, useState } from "react"
import { usernameSchema } from "@/lib/validation"
import { SITE_HOST, normalizeUsername } from "@/lib/site"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * The name-claim field. A plain GET form to `/auth/signup?username=<name>`, so it works
 * before (and without) JavaScript. With it, input is normalized as you type and format
 * problems are said in words. Availability is checked on the signup page.
 */
export function ClaimForm({ buttonLabel = "Claim this name", className }: { buttonLabel?: string; className?: string }) {
  const id = useId()
  const [name, setName] = useState("")
  const [touched, setTouched] = useState(false)

  const parsed = name ? usernameSchema.safeParse(name) : null
  const problem = parsed && !parsed.success ? parsed.error.issues[0]?.message : null
  const showProblem = Boolean(problem) && touched

  return (
    <form
      action="/auth/signup"
      method="get"
      className={cn("w-full max-w-[560px]", className)}
      onSubmit={(e) => {
        if (problem) {
          e.preventDefault()
          setTouched(true)
        }
      }}
    >
      <label htmlFor={id} className="type-small font-semibold text-ink">
        Pick the name for your page
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <div
          className={cn(
            "flex h-14 shrink-0 items-center rounded-label border bg-sheet sm:min-w-0 sm:flex-1 transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pink",
            showProblem ? "border-danger" : "border-ink",
          )}
        >
          <span className="tabular shrink-0 pl-3 text-[0.9375rem] text-ink-soft select-none sm:pl-4 sm:text-base" aria-hidden="true">
            {SITE_HOST}/
          </span>
          <input
            id={id}
            name="username"
            value={name}
            onChange={(e) => setName(normalizeUsername(e.target.value))}
            onBlur={() => setTouched(true)}
            required
            minLength={3}
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="yourname"
            aria-invalid={showProblem ? true : undefined}
            aria-describedby={`${id}-help`}
            className="press-bare-input h-full min-w-0 flex-1 bg-transparent pr-3 text-[0.9375rem] font-semibold text-ink placeholder:font-normal placeholder:text-ink-soft sm:text-base"
          />
        </div>
        <Button type="submit" variant="pink" size="touch" className="h-14 shrink-0 px-6">
          {buttonLabel}
        </Button>
      </div>
      <p id={`${id}-help`} aria-live="polite" className={cn("type-small mt-2", showProblem ? "text-danger-ink" : "text-ink-soft")}>
        {showProblem ? `${problem}.` : "Free. Lowercase letters, numbers, hyphens and underscores."}
      </p>
    </form>
  )
}
