"use client"

import { Slide } from "./slide-deck"
import { SpringCounter } from "./spring-counter"
import { HoverLift, SlideItem } from "./slide-motion"

type StepKind = "username" | "theme" | "blocks" | "analytics"

const steps: { label: string; title: string; desc: string; kind: StepKind }[] = [
  {
    label: "01",
    title: "Pick a username",
    desc: "No email verification. No card. A name and you are live.",
    kind: "username",
  },
  {
    label: "02",
    title: "Choose your look",
    desc: "Eight themes. Colors, fonts, backgrounds — all yours.",
    kind: "theme",
  },
  {
    label: "03",
    title: "Drop in blocks",
    desc: "Links, embeds, forms, countdowns. Ten types. Drag to reorder.",
    kind: "blocks",
  },
  {
    label: "04",
    title: "Watch what happens",
    desc: "Clicks, views, referrers. Real numbers — no guesswork.",
    kind: "analytics",
  },
]

const stats = [
  { value: 10, suffix: "", label: "block types" },
  { value: 8, suffix: "", label: "themes" },
  { value: 100, suffix: "%", label: "open source" },
]

/** Mini product UI per step — clearer than a stock photo. */
function StepVisual({ kind }: { kind: StepKind }) {
  if (kind === "username") {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center rounded-lg border border-white/10 bg-ink px-2.5 py-2 text-[10px]">
          <span className="text-bone/40">linknest.app/</span>
          <span className="font-semibold text-bone">alex</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[#6B9E8C]">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#6B9E8C]/20">✓</span>
          Available
        </div>
      </div>
    )
  }

  if (kind === "theme") {
    return (
      <div className="grid w-full grid-cols-2 gap-1.5">
        {[
          ["#0F211D", "#D2A24C"],
          ["#E7DFC9", "#D2A24C"],
          ["#1A0F0C", "#DD5B39"],
          ["#162822", "#6B9E8C"],
        ].map(([bg, accent], i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md border border-white/10 p-1.5"
            style={{ backgroundColor: bg }}
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            <span className="h-1 flex-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.35 }} />
          </div>
        ))}
      </div>
    )
  }

  if (kind === "blocks") {
    return (
      <div className="w-full space-y-1.5">
        {[
          { w: "100%", accent: true },
          { w: "88%", accent: false },
          { w: "94%", accent: false },
        ].map((row, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
              row.accent ? "border-gold/30 bg-gold/15" : "border-white/10 bg-ink"
            }`}
            style={{ width: row.w }}
          >
            <span className="flex flex-col gap-[2px]">
              <span className="block h-[2px] w-2.5 rounded-full bg-bone/30" />
              <span className="block h-[2px] w-2.5 rounded-full bg-bone/30" />
            </span>
            <span
              className={`h-1.5 flex-1 rounded-full ${row.accent ? "bg-gold/50" : "bg-bone/15"}`}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-end gap-1.5">
      {[35, 55, 42, 78, 62, 95].map((height, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm ${i === 5 ? "bg-gold" : "bg-gold/25"}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

/** Dense craft chapter: proof + four steps across two packed slides. */
export function CraftSteps() {
  return (
    <>
      <Slide id="craft" backdropVariant="craft">
        <div className="flex h-full flex-col justify-center gap-8">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-10">
            <div>
              <SlideItem index={0} from="left">
                <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Craft</p>
              </SlideItem>
              <SlideItem index={1} from="up">
                <h2 className="mt-2 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[1.02] text-bone">
                  Free. Open.
                  <br />
                  Four steps, no fluff.
                </h2>
              </SlideItem>
              <SlideItem index={2} from="up">
                <p className="mt-3 max-w-md text-body leading-relaxed text-bone/75">
                  From a blank username to a live page people can follow — without a template cage or a paywall.
                </p>
              </SlideItem>
            </div>
            <SlideItem index={2} from="right" className="grid grid-cols-3 gap-2 rounded-2xl border border-white/12 bg-ink/55 p-4 backdrop-blur-sm md:gap-4 md:p-5">
              {stats.map((s) => (
                <SpringCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </SlideItem>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
            {steps.map((s, i) => (
              <SlideItem key={s.label} index={3 + i} from="up" staggerMs={55}>
                <HoverLift>
                  <div className="rounded-2xl border border-white/12 bg-surface/55 px-4 py-4 backdrop-blur-sm md:px-5 md:py-5">
                    <span className="font-mono text-small text-gold">{s.label}</span>
                    <p className="mt-2 font-display text-[1.05rem] font-bold leading-tight text-bone md:text-heading">
                      {s.title}
                    </p>
                    <p className="mt-2 hidden text-caption leading-snug text-bone/65 sm:block">{s.desc}</p>
                  </div>
                </HoverLift>
              </SlideItem>
            ))}
          </div>
        </div>
      </Slide>

      <Slide>
        <div className="grid h-full grid-cols-1 content-center gap-3 sm:grid-cols-2 lg:gap-4">
          {steps.map((step, i) => (
            <SlideItem
              key={step.label}
              index={i}
              from={i % 2 === 0 ? "left" : "right"}
              staggerMs={80}
            >
              <HoverLift lift={4}>
                <div className="grid min-h-[148px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-2xl border border-white/10 bg-surface/55 md:min-h-[168px]">
                  <div className="flex flex-col justify-center p-4 md:p-5">
                    <span className="font-mono text-small uppercase tracking-[0.16em] text-gold/90">{step.label}</span>
                    <h3 className="mt-1.5 font-display text-[1.25rem] font-bold leading-tight text-bone md:text-[1.45rem]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-caption leading-relaxed text-bone/70 md:text-body">{step.desc}</p>
                  </div>
                  <div className="flex items-center justify-center border-l border-white/10 bg-ink/45 p-3.5 md:p-4">
                    <StepVisual kind={step.kind} />
                  </div>
                </div>
              </HoverLift>
            </SlideItem>
          ))}
        </div>
      </Slide>
    </>
  )
}
