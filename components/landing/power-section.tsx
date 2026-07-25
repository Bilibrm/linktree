"use client"

import dynamic from "next/dynamic"
import { HoverLift, SlideItem } from "./slide-motion"

const AnalyticsChart = dynamic(
  () => import("./analytics-chart").then((m) => ({ default: m.AnalyticsChart })),
  { ssr: false }
)

const reasons = [
  "Theme customization end to end",
  "Ten block types, not three",
  "Click analytics without PII",
  "Password pages & scheduling",
  "Forms that actually collect",
  "Open source — no paywall",
]

export function PowerSection({ embedded = false }: { embedded?: boolean }) {
  const inner = (
    <div className="grid gap-8 md:grid-cols-2 md:gap-10 md:items-start">
      <div>
        <SlideItem index={0} from="left">
          <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Analytics</p>
        </SlideItem>
        <SlideItem index={1} from="up">
          <h2 className="mt-2 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-black leading-[1.05] text-bone">
            Know which links work.
          </h2>
        </SlideItem>
        <SlideItem index={2} from="up">
          <p className="mt-3 max-w-sm text-caption leading-relaxed text-bone/75 md:text-body">
            Clicks, views, referrers — numbers that help you ship better content, not profiles of people.
          </p>
        </SlideItem>
        <SlideItem index={3} from="scale">
          <div className="mt-5 rounded-2xl border border-white/10 bg-surface/40 p-3 md:p-4">
            <AnalyticsChart />
          </div>
        </SlideItem>
      </div>
      <div>
        <SlideItem index={1} from="right">
          <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Why LinkNest</p>
        </SlideItem>
        <SlideItem index={2} from="right">
          <h2 className="mt-2 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-black leading-[1.05] text-bone">
            More than a stack of URLs.
          </h2>
        </SlideItem>
        <div className="mt-5 grid gap-2.5">
          {reasons.map((r, i) => (
            <SlideItem key={r} index={3 + i} from="right" staggerMs={50}>
              <HoverLift lift={3}>
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-surface/30 px-4 py-3 text-caption text-bone/85 md:text-body">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {r}
                </div>
              </HoverLift>
            </SlideItem>
          ))}
        </div>
      </div>
    </div>
  )

  if (embedded) return inner

  return (
    <section id="power" className="relative z-10 px-6 py-24">
      {inner}
    </section>
  )
}
