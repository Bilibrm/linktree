"use client"

import { useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { SlideItem } from "./slide-motion"

const themes = [
  { name: "Forest", bg: "#0F211D", card: "#17332C", accent: "#D2A24C", ink: "#E7DFC9" },
  { name: "Parchment", bg: "#E7DFC9", card: "#ECE6D6", accent: "#D2A24C", ink: "#0F211D" },
  { name: "Ember", bg: "#1A0F0C", card: "#241712", accent: "#DD5B39", ink: "#E7DFC9" },
  { name: "Mist", bg: "#162822", card: "#1C332C", accent: "#6B9E8C", ink: "#E7DFC9" },
]

function ThemePreview({
  theme,
  active,
  onClick,
}: {
  theme: (typeof themes)[number]
  active: boolean
  onClick: () => void
}) {
  const spring = useSpring({
    scale: active ? 1.04 : 1,
    opacity: active ? 1 : 0.72,
    y: active ? -2 : 0,
    config: { tension: 300, friction: 20 },
  })

  return (
    <animated.button
      type="button"
      onClick={onClick}
      style={spring}
      className={`overflow-hidden rounded-2xl border text-left transition-colors ${
        active ? "border-gold ring-1 ring-gold/40" : "border-white/12 hover:border-white/25"
      }`}
    >
      <div className="p-4 md:p-5" style={{ backgroundColor: theme.bg }}>
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold"
          style={{ backgroundColor: theme.card, color: theme.accent }}
        >
          A
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-[72%] rounded-full" style={{ backgroundColor: theme.card }} />
          <div className="h-2.5 w-1/2 rounded-full" style={{ backgroundColor: theme.card }} />
          <div className="mt-3 h-8 rounded-lg" style={{ backgroundColor: theme.accent }} />
        </div>
      </div>
      <div className="border-t border-white/10 bg-surface/80 px-3 py-2.5">
        <span className={`font-mono text-small ${active ? "text-gold" : "text-bone/65"}`}>{theme.name}</span>
      </div>
    </animated.button>
  )
}

export function ThemeStage({ embedded = false }: { embedded?: boolean }) {
  const [preview, setPreview] = useState(themes[0])

  const bar = useSpring({
    backgroundColor: preview.bg,
    config: { tension: 180, friction: 28 },
  })

  const accent = useSpring({
    color: preview.accent,
    config: { tension: 200, friction: 24 },
  })

  const ink = useSpring({
    color: preview.ink,
    config: { tension: 200, friction: 24 },
  })

  const btn = useSpring({
    backgroundColor: preview.accent,
    config: { tension: 200, friction: 24 },
  })

  const inner = (
    <div className="flex h-full flex-col justify-center gap-7">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <SlideItem index={0} from="left">
            <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Theming</p>
          </SlideItem>
          <SlideItem index={1} from="up">
            <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-black leading-[1.05] text-bone">
              Pick a look. Make it yours.
            </h2>
          </SlideItem>
        </div>
        <SlideItem index={2} from="right">
          <p className="max-w-sm text-caption leading-relaxed text-bone/70 md:text-right md:text-body">
            Colors, fonts, buttons, hovers — tap a theme. The page updates instantly.
          </p>
        </SlideItem>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {themes.map((t, i) => (
          <SlideItem key={t.name} index={3 + i} from="scale" staggerMs={60}>
            <ThemePreview theme={t} active={preview.name === t.name} onClick={() => setPreview(t)} />
          </SlideItem>
        ))}
      </div>

      <SlideItem index={7} from="up">
        <animated.div
          style={bar}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-4 md:px-6"
        >
          <div>
            <animated.p style={accent} className="font-mono text-small uppercase tracking-[0.16em]">
              Live preview
            </animated.p>
            <animated.p style={ink} className="mt-1 font-display text-lg font-bold md:text-xl">
              {preview.name} on your page
            </animated.p>
          </div>
          <animated.div
            style={btn}
            className="inline-flex min-h-11 items-center rounded-full px-5 text-caption font-semibold text-ink"
          >
            Start your page
          </animated.div>
        </animated.div>
      </SlideItem>
    </div>
  )

  if (embedded) return <div className="mx-auto w-full max-w-6xl">{inner}</div>

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="mx-auto max-w-6xl">{inner}</div>
    </section>
  )
}
