"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signupAction, checkUsername } from "@/lib/actions/auth"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowRight, Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import Link from "next/link"

export function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [username, setUsername] = useState("")

  async function handleUsernameBlur(val: string) {
    setUsername(val)
    if (val.length < 3) return
    setUsernameChecking(true)
    const result = await checkUsername(val)
    setUsernameAvailable(result.available)
    setUsernameChecking(false)
    if (!result.available && result.error) {
      setFieldErrors((prev) => ({ ...prev, username: result.error || "Username taken" }))
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.username
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const result: any = await signupAction(formData)

    if (result?.error) {
      if (result.field && typeof result.field === "object") {
        const entries = Object.entries(result.field)
        const mapped: Record<string, string> = {}
        for (const [k, v] of entries) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v)
        }
        setFieldErrors(mapped)
      } else {
        setError(String(result.error))
      }
      toast.error(String(result.error))
      setLoading(false)
      return
    }

    toast.success("Account created!")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-display font-bold text-ink">Create your page</h1>
        <p className="text-body text-muted-foreground mt-1">Pick a username and you are live.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-caption font-medium text-ink">Username</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-ink/30 text-caption pointer-events-none z-10">
              linknest.app/
            </span>
            <Input
              id="username"
              name="username"
              className="pl-[8.5rem] h-11 bg-white border-ink/10 text-ink placeholder:text-ink/30 focus:border-gold focus:ring-gold/20 rounded-xl"
              placeholder="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameAvailable(null)
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  delete next.username
                  return next
                })
              }}
              onBlur={(e) => handleUsernameBlur(e.target.value)}
              required
              minLength={3}
              maxLength={30}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameChecking ? (
                <Loader2 className="w-4 h-4 animate-spin text-ink/30" />
              ) : usernameAvailable === true ? (
                <Check className="w-4 h-4 text-gold" />
              ) : usernameAvailable === false ? (
                <X className="w-4 h-4 text-coral" />
              ) : null}
            </div>
          </div>
          {usernameChecking && <p className="text-small text-ink/40">Checking availability...</p>}
          {usernameAvailable === true && <p className="text-small text-gold">Username available!</p>}
          {fieldErrors.username && <p className="text-small text-coral">{fieldErrors.username}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-caption font-medium text-ink">Display name <span className="text-ink/30">(optional)</span></label>
          <Input id="name" name="name" placeholder="Your name" maxLength={60} className="h-11 bg-white border-ink/10 text-ink placeholder:text-ink/30 focus:border-gold focus:ring-gold/20 rounded-xl" />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-caption font-medium text-ink">Email</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11 bg-white border-ink/10 text-ink placeholder:text-ink/30 focus:border-gold focus:ring-gold/20 rounded-xl" />
          {fieldErrors.email && <p className="text-small text-coral">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-caption font-medium text-ink">Password</label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="h-11 bg-white border-ink/10 text-ink placeholder:text-ink/30 focus:border-gold focus:ring-gold/20 rounded-xl pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-small text-coral">{fieldErrors.password}</p>}
        </div>

        {error && (
          <p className="text-small text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-ink text-bone font-semibold text-caption flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Create your page <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-caption text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-ink hover:text-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}
