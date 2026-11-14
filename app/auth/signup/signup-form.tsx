"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { signupAction, checkUsername } from "@/lib/actions/auth"
import { usernameSchema } from "@/lib/validation"
import { SITE_HOST, normalizeUsername } from "@/lib/site"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Proof } from "@/components/landing/proof"
import { pickerBlocks, pressTheme } from "@/components/landing/sample-page"
import { FieldError, FieldLabel, authInputClass } from "../field"

type NameState =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken" }
  | { kind: "unknown" }

/** Format check only, no network. Mirrors the server's `usernameSchema`. */
function formatState(name: string): NameState {
  if (!name) return { kind: "empty" }
  const parsed = usernameSchema.safeParse(name)
  if (!parsed.success) return { kind: "invalid", message: parsed.error.issues[0]?.message ?? "That name can't be used" }
  return { kind: "checking" }
}

const HELP = "Lowercase letters, numbers, hyphens and underscores. 3 to 30 characters."

export function SignupForm({ initialUsername = "" }: { initialUsername?: string }) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername)
  const [displayName, setDisplayName] = useState("")
  const [nameState, setNameState] = useState<NameState>(() => formatState(initialUsername))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showPw, setShowPw] = useState(false)
  const latestCheck = useRef(0)
  // A half-typed name is not an error yet: hold format complaints until blur or 3 characters.
  const [nameTouched, setNameTouched] = useState(Boolean(initialUsername))

  // Ask the server whether the name is free, a beat after typing stops.
  // Late answers for an older value are dropped.
  useEffect(() => {
    if (formatState(username).kind !== "checking") return
    const id = ++latestCheck.current
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsername(username)
        if (id !== latestCheck.current) return
        setNameState(result.available ? { kind: "available" } : { kind: "taken" })
      } catch {
        if (id === latestCheck.current) setNameState({ kind: "unknown" })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [username])

  function handleUsernameChange(raw: string) {
    const next = normalizeUsername(raw)
    latestCheck.current++
    setUsername(next)
    setNameState(formatState(next))
    setFieldErrors((prev) => {
      if (!prev.username) return prev
      const rest = { ...prev }
      delete rest.username
      return rest
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})

    const result = await signupAction(new FormData(e.currentTarget))

    if (result?.error) {
      if ("field" in result && result.field === true && typeof result.error === "object" && result.error !== null) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(result.error)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setFieldErrors(mapped)
      } else if ("field" in result && result.field === "username") {
        latestCheck.current++
        setNameState({ kind: "taken" })
      } else if ("field" in result && result.field === "email") {
        setFieldErrors({ email: "An account already uses this email. Log in instead, or use another email." })
      } else {
        setError(String(result.error))
      }
      setLoading(false)
      return
    }

    toast.success("Your page is live")
    router.push("/dashboard")
    router.refresh()
  }

  const showFormat = nameTouched || username.length >= 3
  const shownState: NameState = nameState.kind === "invalid" && !showFormat ? { kind: "empty" } : nameState
  const nameInvalid = shownState.kind === "invalid" || shownState.kind === "taken" || Boolean(fieldErrors.username)

  return (
    <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-16">
      <div className="w-full max-w-[400px]">
        <h1 className="type-title-1">Claim your name</h1>
        <p className="type-body mt-3 text-ink-soft">It becomes the address of your page. You can fill the page in after.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <FieldLabel htmlFor="username">Name</FieldLabel>
            <div
              className={`flex h-14 items-center rounded-label border bg-sheet transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pink ${
                nameInvalid ? "border-danger" : "border-ink"
              }`}
            >
              <span className="tabular shrink-0 pl-3 text-[0.9375rem] text-ink-soft select-none" aria-hidden="true">
                {SITE_HOST}/
              </span>
              <input
                id="username"
                name="username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={() => setNameTouched(true)}
                required
                minLength={3}
                maxLength={30}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="yourname"
                aria-invalid={nameInvalid ? true : undefined}
                aria-describedby="username-status"
                className="press-bare-input h-full min-w-0 flex-1 bg-transparent pr-3 text-[0.9375rem] font-semibold text-ink placeholder:font-normal placeholder:text-ink-soft"
              />
            </div>
            <div id="username-status" aria-live="polite" className="min-h-[1.3rem]">
              {fieldErrors.username ? (
                <FieldError>{fieldErrors.username}</FieldError>
              ) : (
                <NameStatus state={shownState} username={username} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="name" hint="Optional">Display name</FieldLabel>
            <Input
              id="name"
              name="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              className={authInputClass}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={authInputClass}
            />
            {fieldErrors.email && <FieldError id="email-error">{fieldErrors.email}</FieldError>}
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="password" hint="8 characters or more">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={`${authInputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-soft transition-colors duration-150 hover:text-ink"
              >
                {showPw ? <EyeOff className="size-[18px]" strokeWidth={1.75} /> : <Eye className="size-[18px]" strokeWidth={1.75} />}
              </button>
            </div>
            {fieldErrors.password && <FieldError id="password-error">{fieldErrors.password}</FieldError>}
          </div>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" variant="pink" size="touch" disabled={loading} className="w-full">
            {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
            Create your page
          </Button>
        </form>

        <p className="type-body mt-8 text-ink-soft">
          Already have a page?{" "}
          <Link href="/auth/login" className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>

      {/* From 1024px up: the page header as it will read, live from the two name fields. */}
      <aside className="hidden justify-center pt-2 lg:flex" aria-label="Preview of your page">
        <Proof
          blocks={pickerBlocks}
          theme={pressTheme}
          username={username || "yourname"}
          name={displayName.trim() || username || "Your name"}
          className="sticky top-8 self-start"
        />
      </aside>
    </div>
  )
}

function NameStatus({ state, username }: { state: NameState; username: string }) {
  switch (state.kind) {
    case "empty":
      return <p className="type-small text-ink-soft">{HELP}</p>
    case "invalid":
      return <FieldError>{state.message}.</FieldError>
    case "checking":
      return <p className="type-small text-ink-soft">Checking {username}…</p>
    case "available":
      return (
        <p className="type-small flex items-start gap-1.5 text-ink">
          <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          <span>
            <span className="font-semibold">{username}</span> is available.
          </span>
        </p>
      )
    case "taken":
      return (
        <p className="type-small flex items-start gap-1.5 text-danger-ink">
          <X className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
          <span>
            <span className="font-semibold">{username}</span> is taken. Try adding a word or a number.
          </span>
        </p>
      )
    case "unknown":
      return <p className="type-small text-ink-soft">Couldn&apos;t check that name right now. You can still continue.</p>
  }
}
