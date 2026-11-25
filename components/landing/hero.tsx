"use client"

import { useRef, useState } from "react"
import { ClaimForm } from "./claim-form"
import { Proof } from "./proof"
import { resolveTheme, resolveThemeId } from "@/lib/themes"
import { heroBlocks, samplePerson } from "./sample-page"
import { usePressMotion } from "./use-press-motion"

const HEADLINE = ["One page", "for all", "of it."]
/** The page lands on plain stock, then takes its theme once. */
// In the app's own Archivo, so the hero asks no third party for a font mid-animation.
const plainTheme = resolveTheme({ preset: "monochrome", v2: { theme: "monochrome", font: "archivo" } })
const pressTheme = resolveThemeId("riso")

/**
 * The one bold thing on the landing page: the headline printed in two inks, and a page
 * being composed beside it. The server renders the finished page; with motion allowed the
 * blocks are held back (see `[data-compose]` in globals.css), land one by one on a plain
 * page, and then the page takes its theme once.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const [theme, setTheme] = useState(pressTheme)

  usePressMotion(
    root,
    (gsap) => {
      const stage = root.current?.querySelector<HTMLElement>("[data-compose]")
      if (!stage) return
      const items = gsap.utils.toArray<HTMLElement>("[data-compose-item]")

      gsap.set(items, { opacity: 0 })
      setTheme(plainTheme)
      stage.dataset.compose = "running"

      gsap
        .timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: stage, start: "top 80%", once: true } })
        .fromTo(
          items,
          { opacity: 0, y: -36, rotate: (i) => (i % 2 ? 2.5 : -2.5) },
          { opacity: 1, y: 0, rotate: 0, duration: 0.55, stagger: 0.32 },
        )
        .call(() => setTheme(pressTheme), undefined, "+=0.5")
        .fromTo(stage, { x: -4, y: -4 }, { x: 0, y: 0, duration: 0.35, ease: "power2.out" }, "<")
        .call(() => {
          stage.dataset.compose = "done"
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
    <section ref={root} className="press-grain relative overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-[1280px] gap-12 px-5 pt-8 pb-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-16 lg:pt-16 lg:pb-40">
        <div className="min-w-0">
          <h1 className="type-display overprint uppercase whitespace-nowrap lg:text-[length:clamp(4.5rem,7.6vw,7.5rem)]">
            <span className="overprint-pink" aria-hidden="true">
              {HEADLINE.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
            <span className="overprint-blue">
              {HEADLINE.map((line) => (
                <span key={line} className="block">
                  {line}{" "}
                </span>
              ))}
            </span>
          </h1>
          <p className="type-body mt-8 max-w-[44ch] text-lg text-ink">
            Your links, your shop, your photos, a sign-up form. Stack them on one page and hand out one address.
          </p>
          <ClaimForm className="mt-8" />
        </div>

        <div data-compose="pending" className="flex justify-center lg:justify-end lg:pt-3">
          <Proof blocks={heroBlocks} theme={theme} username={samplePerson.username} name={samplePerson.name} bio={samplePerson.bio} compose />
        </div>
      </div>
    </section>
  )
}
