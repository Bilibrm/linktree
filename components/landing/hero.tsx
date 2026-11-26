"use client"

import { useRef, useState } from "react"
import { ClaimForm } from "./claim-form"
import { Proof } from "./proof"
import { resolveTheme, resolveThemeId } from "@/lib/themes"
import { heroBlocks, samplePerson } from "./sample-page"
import { REVEAL_EASE, useLandingMotion } from "./motion"

const HEADLINE = ["One page", "for all", "of it."]
/** The page lands on plain stock, then takes its theme once. */
// In the app's own Archivo, so the hero asks no third party for a font mid-animation.
const plainTheme = resolveTheme({ preset: "monochrome", v2: { theme: "monochrome", font: "archivo" } })
const pressTheme = resolveThemeId("riso")

function Plate({ className, hidden }: { className: string; hidden?: boolean }) {
  return (
    <span className={className} aria-hidden={hidden || undefined}>
      {HEADLINE.map((line, i) => (
        <span key={line} className="rise-mask">
          <span className="rise-line" style={{ "--i": i } as React.CSSProperties}>
            {line}
            {hidden ? null : " "}
          </span>
        </span>
      ))}
    </span>
  )
}

/**
 * The one bold thing on the landing page (DESIGN_SYSTEM.md §2, §6.1): the headline in two
 * faintly misregistered inks, and a page being composed beside it.
 *
 * The headline lines rise in once on load in CSS (`.rise-line` in globals.css), so they
 * need no script and paint with the HTML. With motion allowed, the proof's blocks land one
 * by one on plain stock and the page then takes its theme; past the fold the copy eases
 * back and up while the proof frame trails it.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const [theme, setTheme] = useState(pressTheme)

  useLandingMotion(
    root,
    (gsap) => {
      const stage = root.current?.querySelector<HTMLElement>("[data-compose]")
      if (!stage) return
      const items = gsap.utils.toArray<HTMLElement>("[data-compose-item]")

      gsap.set(items, { opacity: 0 })
      setTheme(plainTheme)
      stage.dataset.compose = "running"

      gsap
        .timeline({ delay: 0.45, defaults: { ease: REVEAL_EASE } })
        .fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 })
        .call(() => setTheme(pressTheme), undefined, "+=0.35")
        .call(() => {
          stage.dataset.compose = "done"
        })

      // Past the fold: the copy settles back and up; the proof frame moves slower.
      const mm = gsap.matchMedia()
      mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (context) => {
        const desktop = Boolean(context.conditions?.desktop)
        const scrub = { trigger: root.current, start: "top top", end: "bottom top", scrub: true }
        gsap.to("[data-hero-copy]", { scale: 0.96, y: desktop ? -72 : -32, opacity: 0.55, ease: "none", transformOrigin: "0% 0%", scrollTrigger: scrub })
        gsap.to("[data-hero-proof]", { y: desktop ? -28 : -12, ease: "none", scrollTrigger: scrub })
      })

      // Reverting (unmount, fast refresh) must leave the finished page, not a half-built one.
      return () => setTheme(pressTheme)
    },
    () => {
      const stage = root.current?.querySelector<HTMLElement>("[data-compose]")
      if (stage) stage.dataset.compose = "done"
    },
  )

  return (
    <section ref={root} className="relative overflow-clip">
      <div className="landing-wrap grid gap-16 pt-8 pb-32 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-16 lg:pt-16 lg:pb-48">
        <div data-hero-copy className="min-w-0 will-change-transform">
          <h1 className="type-display overprint uppercase whitespace-nowrap lg:text-[length:clamp(4.5rem,7.6vw,7.5rem)]">
            <Plate className="overprint-pink" hidden />
            <Plate className="overprint-blue" />
          </h1>
          <p className="type-body rise-after mt-8 max-w-[44ch] text-lg text-ink">
            Your links, your shop, your photos, a sign-up form. Stack them on one page and hand out one address.
          </p>
          <ClaimForm className="rise-after mt-8" />
        </div>

        <div data-hero-proof data-compose="pending" className="flex justify-center will-change-transform lg:justify-end lg:pt-3">
          <Proof blocks={heroBlocks} theme={theme} username={samplePerson.username} name={samplePerson.name} bio={samplePerson.bio} compose />
        </div>
      </div>
    </section>
  )
}
