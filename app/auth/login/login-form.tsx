"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { loginActionRaw } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldError, FieldLabel, authInputClass } from "../field"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await loginActionRaw({ email, password })
    if (result?.error) {
      setError("That email and password don't match an account. Check both and try again.")
      setLoading(false)
      return
    }

    toast.success("Logged in")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <>
      <h1 className="type-title-1">Log in</h1>
      <p className="type-body mt-3 text-ink-soft">Pick up where you left your page.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={error ? true : undefined}
            className={authInputClass}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
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
        </div>

        {error && <FieldError id="login-error">{error}</FieldError>}

        <Button type="submit" variant="pink" size="touch" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          Log in
        </Button>
      </form>

      <p className="type-body mt-8 text-ink-soft">
        No page yet?{" "}
        <Link href="/auth/signup" className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4">
          Claim your name
        </Link>
      </p>
    </>
  )
}
