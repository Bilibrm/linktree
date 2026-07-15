"use client"

import Image from "next/image"
import { landingImages } from "./landing-images"
import { Slide } from "./slide-deck"
import { SpringCounter } from "./spring-counter"
import { HoverLift, SlideItem } from "./slide-motion"

const steps = [
  {
    label: "01",
    title: "Pick a username",
    desc: "No email verification. No card. A name and you are live.",
    image: landingImages.steps[0],
  },
  {
    label: "02",
    title: "Choose your look",
    desc: "Eight themes. Colors, fonts, backgrounds — all yours.",
    image: landingImages.steps[1],
  },
  {
    label: "03",
    title: "Drop in blocks",
    desc: "Links, embeds, forms, countdowns. Ten types. Drag to reorder.",
    image: landingImages.steps[2],
  },
  {
    label: "04",
    title: "Watch what happens",
    desc: "Clicks, views, referrers. Real numbers — no guesswork.",
    image: landingImages.steps[3],
  },
]

const stats = [
  { value: 10, suffix: "", label: "block types" },
  { value: 8, suffix: "", label: "themes" },
  { value: 100, suffix: "%", label: "open source" },
]

/** Dense craft chapter: proof + four steps across two packed slides. */
export function CraftSteps() {
  return (
    <>
      <Slide
        id="craft"
        bgImage={landingImages.craftBand}
        bgPosition={landingImages.craftBandPosition}
        tint="bg-gradient-to-br from-ink/92 via-ink/78 to-ink/88"
      >
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
                  <div className="relative min-h-[120px]">
                    <Image
                      src={step.image.src}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectPosition: step.image.position }}
                      sizes="(max-width:768px) 40vw, 22vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface/45" />
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
