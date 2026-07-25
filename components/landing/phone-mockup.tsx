"use client"

import { animated } from "@react-spring/web"
import { cn } from "@/lib/utils"

type PhoneMockupProps = {
  style?: React.ComponentProps<typeof animated.div>["style"]
  className?: string
}

const links = [
  { label: "Latest drop", primary: true },
  { label: "Watch the film", primary: false },
  { label: "Book a session", primary: false },
]

export function PhoneMockup({ style, className = "" }: PhoneMockupProps) {
  return (
    <animated.div
      style={{ transformStyle: "preserve-3d", ...style }}
      className={cn("relative w-[272px]", className)}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[3.5rem] bg-gold/20 opacity-60 blur-3xl"
      />

      {/* Device shell */}
      <div className="relative rounded-[2.35rem] border border-white/25 bg-[#070d0b] p-[9px] shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
        {/* Hardware buttons */}
        <div className="absolute -left-[2px] top-[88px] h-7 w-[3px] rounded-l-sm bg-white/25" />
        <div className="absolute -left-[2px] top-[124px] h-12 w-[3px] rounded-l-sm bg-white/25" />
        <div className="absolute -right-[2px] top-[110px] h-16 w-[3px] rounded-r-sm bg-white/25" />

        {/* Screen */}
        <div className="relative flex h-[520px] flex-col overflow-hidden rounded-[1.85rem] bg-ink">
          {/* Status island */}
          <div className="absolute left-1/2 top-3 z-10 h-6 w-[88px] -translate-x-1/2 rounded-full bg-black" />

          {/* Soft top wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-gold/10 to-transparent"
          />

          <div className="relative flex h-full flex-col px-5 pb-5 pt-12">
            {/* Profile */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full border border-gold/30 bg-surface font-display text-2xl font-bold text-gold shadow-[0_0_24px_rgba(210,162,76,0.25)]">
                A
              </div>
              <p className="mt-3 font-display text-lg font-bold text-bone">@alex</p>
              <p className="mt-1 max-w-[180px] text-[11px] leading-snug text-bone/55">
                Designer · building in public · new work weekly
              </p>
            </div>

            {/* Socials */}
            <div className="mt-4 flex justify-center gap-2">
              {["ig", "x", "yt", "gh"].map((social) => (
                <div
                  key={social}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-surface font-mono text-[9px] text-bone/65"
                >
                  {social}
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="mt-5 space-y-2.5">
              {links.map((link) => (
                <div
                  key={link.label}
                  className={cn(
                    "flex h-11 items-center justify-between rounded-xl px-4 text-[12px] font-semibold",
                    link.primary
                      ? "bg-gold text-ink shadow-[0_8px_24px_rgba(210,162,76,0.28)]"
                      : "border border-white/10 bg-surface text-bone/85"
                  )}
                >
                  <span>{link.label}</span>
                  <span className={link.primary ? "text-ink/60" : "text-bone/40"}>→</span>
                </div>
              ))}
            </div>

            {/* Newsletter block */}
            <div className="mt-3 rounded-xl border border-white/8 bg-surface/80 p-3.5">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-gold/80">
                Newsletter
              </p>
              <div className="mt-2.5 flex gap-2">
                <div className="flex h-9 flex-1 items-center rounded-lg border border-white/8 bg-ink px-3 text-[9px] text-bone/40">
                  you@email.com
                </div>
                <div className="flex h-9 items-center rounded-lg bg-gold px-3.5 text-[9px] font-bold text-ink">
                  Join
                </div>
              </div>
            </div>

            <p className="mt-auto pt-4 text-center font-mono text-[8px] tracking-[0.24em] text-bone/30">
              LINKNEST
            </p>
          </div>
        </div>
      </div>
    </animated.div>
  )
}
