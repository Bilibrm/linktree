"use client"

import { useEffect, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { Pause, Play } from "lucide-react"
import { SlideItem } from "./slide-motion"
import { useMotionProfile } from "./hooks/use-motion-profile"

type Theme = {
  name: string
  bg: string
  card: string
  accent: string
  ink: string
  muted: string
}

const themes: Theme[] = [
  { name: "Forest", bg: "#0F211D", card: "#17332C", accent: "#D2A24C", ink: "#E7DFC9", muted: "#90A29C" },
  { name: "Parchment", bg: "#E7DFC9", card: "#F3EEE0", accent: "#D2A24C", ink: "#16302A", muted: "#71817B" },
  { name: "Ember", bg: "#1A0F0C", card: "#2A1712", accent: "#DD5B39", ink: "#F0E6D3", muted: "#A9958A" },
  { name: "Mist", bg: "#162822", card: "#1E3830", accent: "#6B9E8C", ink: "#D4E0DA", muted: "#8DA49B" },
  { name: "Night", bg: "#0C1210", card: "#151E1B", accent: "#C4A35A", ink: "#E8E4D9", muted: "#8B918C" },
  { name: "Bloom", bg: "#1C1420", card: "#2A1E30", accent: "#E8A0BF", ink: "#F2E8F0", muted: "#A99BA7" },
  { name: "Tide", bg: "#0E1A24", card: "#162636", accent: "#5BA4C9", ink: "#D9E6EF", muted: "#869BAA" },
  { name: "Clay", bg: "#231914", card: "#33241C", accent: "#C47A4A", ink: "#EDE0D0", muted: "#A49388" },
]

function ThemeSwatch({
  theme,
  active,
  onSelect,
}: {
  theme: Theme
  active: boolean
  onSelect: () => void
}) {
  const spring = useSpring({
    y: active ? -4 : 0,
    config: { tension: 340, friction: 20 },
  })

  return (
    <animated.button
      type="button"
      aria-pressed={active}
      aria-label={`Preview ${theme.name} theme`}
      onClick={onSelect}
      style={spring}
      className={`group flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-colors ${
        active
          ? "border-gold bg-surface/70 shadow-[0_0_0_1px_rgba(210,162,76,0.35)]"
          : "border-white/10 bg-surface/40 hover:border-white/25 hover:bg-surface/55"
      }`}
    >
      {/* Mini page preview — readable at a glance */}
      <div className="p-2 md:p-2.5">
        <div
          className="relative overflow-hidden rounded-xl border border-black/20 px-2.5 pb-2 pt-2.5 md:px-3 md:pb-2.5 md:pt-3"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="flex flex-col items-center">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full font-display text-[8px] font-bold md:h-6 md:w-6 md:text-[9px]"
              style={{ backgroundColor: theme.card, color: theme.accent }}
            >
              A
            </div>
            <div className="mt-1.5 h-1 w-8 rounded-full md:w-10" style={{ backgroundColor: theme.ink, opacity: 0.85 }} />
            <div className="mt-1 h-0.5 w-6 rounded-full md:w-7" style={{ backgroundColor: theme.muted, opacity: 0.7 }} />
          </div>
          <div className="mt-2 space-y-1 md:mt-2.5">
            <div className="h-3.5 rounded-md md:h-4" style={{ backgroundColor: theme.accent }} />
            <div className="h-3.5 rounded-md md:h-4" style={{ backgroundColor: theme.card }} />
          </div>
        </div>
      </div>

      {/* Label + palette dots */}
      <div className="flex items-center justify-between gap-2 border-t border-white/8 px-2.5 pb-2.5 pt-2 md:px-3">
        <span
          className={`min-w-0 truncate text-[11px] font-medium tracking-wide md:text-caption ${
            active ? "text-gold" : "text-bone/80"
          }`}
        >
          {theme.name}
        </span>
        <span className="flex shrink-0 items-center -space-x-1" aria-hidden>
          {[theme.bg, theme.card, theme.accent].map((color, i) => (
            <span
              key={`${theme.name}-${i}`}
              className="h-2.5 w-2.5 rounded-full border border-white/20 md:h-3 md:w-3"
              style={{ backgroundColor: color, zIndex: 3 - i }}
            />
          ))}
        </span>
      </div>
    </animated.button>
  )
}

function LivePreview({ theme }: { theme: Theme }) {
  const colors = useSpring({
    backgroundColor: theme.bg,
    color: theme.ink,
    config: { tension: 170, friction: 28 },
  })
  const accent = useSpring({
    backgroundColor: theme.accent,
    config: { tension: 170, friction: 28 },
  })
  const card = useSpring({
    backgroundColor: theme.card,
    config: { tension: 170, friction: 28 },
  })

  return (
    <div className="relative mx-auto w-full max-w-[300px] md:max-w-[320px]">
      <animated.div
        aria-hidden
        className="absolute -inset-6 rounded-[3rem] opacity-25 blur-3xl"
        style={{ backgroundColor: theme.accent }}
      />
      <div className="relative rounded-[2.15rem] border border-white/15 bg-[#09100e] p-2.5 shadow-2xl shadow-black/45">
        <animated.div
          style={colors}
          className="relative flex h-[340px] flex-col overflow-hidden rounded-[1.7rem] px-4 pb-8 pt-7 md:h-[520px] md:px-5 md:pb-10 md:pt-11"
        >
          <div className="absolute left-1/2 top-2.5 h-3.5 w-16 -translate-x-1/2 rounded-full bg-black/75 md:h-4 md:w-20" />
          <div className="flex flex-col items-center text-center">
            <animated.div
              style={card}
              className="flex h-12 w-12 items-center justify-center rounded-full font-display text-base font-bold md:h-[4.25rem] md:w-[4.25rem] md:text-2xl"
            >
              <span style={{ color: theme.accent }}>A</span>
            </animated.div>
            <p className="mt-2.5 font-display text-base font-bold md:mt-3 md:text-xl">@alex</p>
            <p className="mt-1 text-[9px] leading-snug md:text-[11px]" style={{ color: theme.muted }}>
              Designer · building in public · new work weekly
            </p>
          </div>

          <div className="mt-4 flex justify-center gap-2 md:mt-5">
            {["ig", "x", "yt"].map((social) => (
              <animated.div
                key={social}
                style={card}
                className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-[8px] md:h-9 md:w-9 md:text-[10px]"
              >
                {social}
              </animated.div>
            ))}
          </div>

          <div className="mt-4 space-y-2 md:mt-5 md:space-y-2.5">
            {["Latest drop", "Watch the film", "Book a session"].map((label, index) => (
              <animated.div
                key={label}
                style={index === 0 ? accent : card}
                className="flex h-9 items-center justify-between rounded-xl px-3.5 text-[10px] font-semibold md:h-11 md:text-[12px]"
              >
                <span style={{ color: index === 0 ? theme.bg : theme.ink }}>{label}</span>
                <span style={{ color: index === 0 ? theme.bg : theme.muted }}>→</span>
              </animated.div>
            ))}
          </div>

          <animated.div style={card} className="mt-3 rounded-xl p-3 md:mt-4 md:p-3.5">
            <p className="font-mono text-[8px] uppercase tracking-wider md:text-[9px]" style={{ color: theme.muted }}>
              Newsletter
            </p>
            <div className="mt-2 flex gap-2">
              <div
                className="flex h-8 flex-1 items-center rounded-lg px-2.5 text-[8px] md:h-9 md:text-[9px]"
                style={{ backgroundColor: theme.bg, color: theme.muted }}
              >
                you@email.com
              </div>
              <animated.div style={accent} className="flex h-8 items-center rounded-lg px-3 text-[8px] font-bold md:h-9 md:text-[9px]">
                <span style={{ color: theme.bg }}>Join</span>
              </animated.div>
            </div>
          </animated.div>

          <p
            className="mt-auto pt-4 text-center font-mono text-[8px] tracking-[0.22em] md:text-[9px]"
            style={{ color: theme.muted }}
          >
            LINKNEST
          </p>
        </animated.div>
      </div>
    </div>
  )
}

export function ThemeStage({ embedded = false }: { embedded?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const profile = useMotionProfile()
  const theme = themes[activeIndex]

  useEffect(() => {
    if (paused || profile.reduceMotion) return
    // Slower cycle on low-power devices to cut paint churn.
    const ms = profile.lowPower ? 5200 : 3000
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % themes.length)
    }, ms)
    return () => window.clearInterval(timer)
  }, [paused, profile.lowPower, profile.reduceMotion])

  function selectTheme(index: number) {
    setActiveIndex(index)
    setPaused(true)
  }

  const inner = (
    <div className="relative grid h-full items-center gap-5 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
      <div>
        <SlideItem index={0} from="left">
          <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Theming</p>
        </SlideItem>
        <SlideItem index={1} from="up">
          <h2 className="mt-1.5 font-display text-[clamp(1.85rem,4vw,3.2rem)] font-black leading-[1.02] text-bone">
            Pick a look.
            <br />
            <span className="text-bone/50">Make it unmistakably yours.</span>
          </h2>
        </SlideItem>
        <SlideItem index={2} from="up">
          <p className="mt-3 max-w-md text-caption leading-relaxed text-bone/70 md:mt-4 md:text-body">
            Eight starting points. Change every color, button, and detail — then watch your page transform live.
          </p>
        </SlideItem>

        <div className="mt-4 grid grid-cols-4 gap-2 md:mt-7 md:gap-2.5">
          {themes.map((item, index) => (
            <SlideItem key={item.name} index={3 + index} from="scale" staggerMs={35}>
              <ThemeSwatch
                theme={item}
                active={index === activeIndex}
                onSelect={() => selectTheme(index)}
              />
            </SlideItem>
          ))}
        </div>

        <SlideItem index={8} from="up">
          <div className="mt-3 flex items-center gap-3 md:mt-5">
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-3 text-caption text-bone/65 transition-colors hover:border-white/30 hover:text-bone"
            >
              {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {paused ? "Resume themes" : "Pause preview"}
            </button>
            <span className="font-mono text-small text-gold">{theme.name}</span>
          </div>
        </SlideItem>
      </div>

      <SlideItem index={2} from="right" className="min-h-0">
        <LivePreview theme={theme} />
      </SlideItem>
    </div>
  )

  if (embedded) return <div className="mx-auto h-full w-full max-w-6xl">{inner}</div>

  return (
    <section className="relative z-10 min-h-dvh px-6 py-20">
      <div className="mx-auto h-full max-w-6xl">{inner}</div>
    </section>
  )
}
