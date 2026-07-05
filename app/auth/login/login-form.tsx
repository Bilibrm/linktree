"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginActionRaw } from "@/lib/actions/auth"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

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

    const result: any = await loginActionRaw({ email, password })
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Welcome back!")
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-display font-bold text-ink">Welcome back</h1>
        <p className="text-body text-muted-foreground mt-1">Sign in to your page.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-caption font-medium text-ink">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 bg-white border-ink/10 text-ink placeholder:text-ink/30 focus:border-gold focus:ring-gold/20 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-caption font-medium text-ink">Password</label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            <>Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-caption text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-ink hover:text-gold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </>
  )
}
