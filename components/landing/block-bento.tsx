"use client"

import Image from "next/image"
import { landingImages } from "./landing-images"
import { HoverLift, SlideItem } from "./slide-motion"

const tiles = [
  {
    id: "link",
    label: "Link",
    span: "md:col-span-2",
    body: (
      <div className="mt-4 flex h-12 items-center rounded-xl bg-gold px-5 text-caption font-semibold text-ink">
        Check out my latest project
      </div>
    ),
  },
  {
    id: "social",
    label: "Social",
    span: "md:col-span-1",
    body: (
      <div className="mt-4 flex flex-wrap gap-2">
        {["ig", "x", "yt", "tt", "gh"].map((s) => (
          <div key={s} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 font-mono text-small text-bone/70">
            {s}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "embed",
    label: "Embed",
    span: "md:col-span-1",
    body: (
      <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-white/10">
        <Image src={landingImages.embed} alt="" fill className="object-cover" sizes="280px" />
        <div className="absolute inset-0 flex items-center justify-center bg-ink/35">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/35">
            <div className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-coral" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "gallery",
    label: "Gallery",
    span: "md:col-span-2",
    body: (
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {landingImages.gallery.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
            <Image src={src} alt="" fill className="object-cover" sizes="100px" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "form",
    label: "Form",
    span: "md:col-span-1",
    body: (
      <div className="mt-4 space-y-2">
        <div className="flex h-9 items-center rounded-lg border border-white/10 bg-ink px-3 text-small text-bone/40">Your email</div>
        <div className="flex h-9 items-center justify-center rounded-lg bg-gold text-small font-semibold text-ink">Subscribe</div>
      </div>
    ),
  },
  {
    id: "countdown",
    label: "Countdown",
    span: "md:col-span-1",
    body: (
      <div className="mt-4 flex gap-1.5">
        {["06", "22", "14", "55"].map((v, i) => (
          <div key={i} className="flex h-11 flex-1 items-center justify-center rounded-lg border border-white/10 bg-ink font-mono text-caption font-bold text-gold">
            {v}
          </div>
        ))}
      </div>
    ),
  },
]

export function BlockBento({ embedded = false }: { embedded?: boolean }) {
  const inner = (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SlideItem index={0} from="left">
            <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Blocks</p>
          </SlideItem>
          <SlideItem index={1} from="up">
            <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-black leading-[1.05] text-bone">
              Build like a nest — not a list.
            </h2>
          </SlideItem>
        </div>
        <SlideItem index={2} from="right">
          <p className="max-w-xs text-caption leading-relaxed text-bone/65 md:text-body">
            Ten block types. Mix links, media, forms, and countdowns on one page.
          </p>
        </SlideItem>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-6 md:grid-cols-3 md:gap-3">
        {tiles.map((tile, i) => (
          <SlideItem key={tile.id} index={3 + i} from="scale" staggerMs={55} className={tile.span}>
            <HoverLift className="h-full">
              <div className="h-full rounded-2xl border border-white/10 bg-surface/55 p-3.5 md:p-5">
                <span className="font-mono text-small text-bone/55">{tile.label}</span>
                {tile.body}
              </div>
            </HoverLift>
          </SlideItem>
        ))}
      </div>
    </>
  )

  if (embedded) return <div className="w-full">{inner}</div>

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="mx-auto max-w-6xl">{inner}</div>
    </section>
  )
}
