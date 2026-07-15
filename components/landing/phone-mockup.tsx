"use client"

import { animated } from "@react-spring/web"

type PhoneMockupProps = {
  style?: React.ComponentProps<typeof animated.div>["style"]
  className?: string
}

export function PhoneMockup({ style, className = "" }: PhoneMockupProps) {
  return (
    <animated.div
      style={{ transformStyle: "preserve-3d", ...style }}
      className={`w-[240px] sm:w-[260px] rounded-[2.25rem] border border-white/10 bg-surface p-3 shadow-2xl shadow-black/40 ${className}`}
    >
      <div className="rounded-[1.6rem] bg-ink border border-white/5 p-5 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center font-display font-bold text-ink text-sm mb-3">A</div>
        <div className="h-2.5 w-20 rounded-full bg-white/10 mb-1.5" />
        <div className="h-2 w-14 rounded-full bg-white/5 mb-4" />
        <div className="w-full space-y-2">
          <div className="h-9 w-full rounded-xl bg-gold/90 flex items-center px-3 text-[10px] font-semibold text-ink">Latest project</div>
          <div className="h-9 w-full rounded-xl border border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">Book a call</div>
          <div className="h-9 w-full rounded-xl border border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">Newsletter</div>
        </div>
        <div className="flex gap-2 mt-4">
          {["ig", "x", "yt"].map((s) => (
            <div key={s} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[8px] text-muted-foreground">{s}</div>
          ))}
        </div>
      </div>
    </animated.div>
  )
}
