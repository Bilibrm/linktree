"use client"

import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink relative overflow-hidden flex-col justify-between p-10">
        {/* topographic contours */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg className="w-full h-full opacity-[0.04]" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
            {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map((y) => (
              <path key={y} d={`M0,${y} Q80,${y - 15} 160,${y} T320,${y} T480,${y} T600,${y}`} fill="none" stroke="#D2A24C" strokeWidth="0.5" />
            ))}
          </svg>
        </div>
        {/* subtle trail line */}
        <div className="absolute left-8 top-0 bottom-0 w-px opacity-10 hidden xl:block">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-gold to-transparent" />
        </div>
        <div className="relative z-10">
          <Link href="/" className="font-display font-black text-xl tracking-tight text-bone">LinkNest</Link>
        </div>
        <div className="relative z-10 max-w-xs">
          <p className="text-body text-muted-foreground leading-relaxed">
            Your corner of the web. One page, everything you share, and the numbers to prove it works.
          </p>
        </div>
        <div className="relative z-10 text-small text-muted-foreground/40">
          Open source. No tracking.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col bg-bone text-ink">
        {/* mobile brand header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-ink/5">
          <Link href="/" className="font-display font-black text-lg tracking-tight text-ink">LinkNest</Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
