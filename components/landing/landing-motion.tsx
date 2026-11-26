"use client"

import { useEffect } from "react"
import { REVEAL_EASE, loadMotion, prefersReducedMotion } from "./motion"

/**
 * The landing page's shared motion (DESIGN_SYSTEM.md §6.1), mounted once on `/`:
 *
 * - Lenis weighted scroll on one clock with GSAP. Not on touch, where native momentum wins.
 * - Soft reveals, once: in each `[data-reveal-group]`, `[data-reveal]` items rise 14px and
 *   fade in, hairlines (`[data-rule]`) draw from the left, in sequence, as the group
 *   reaches 80% of the viewport. Never re-hidden on the way back up.
 * - Image parallax inside clipped frames: `[data-parallax]` frames move their
 *   `[data-parallax-inner]` (drawn 112% tall) from -5% to +5% across the frame's travel.
 *
 * Nothing is hidden by CSS: start states are set here, so without scripts or with reduced
 * motion the page is complete and still. Renders nothing.
 */
export function LandingMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    Promise.all([loadMotion(), import("lenis")])
      .then(([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
        if (cancelled) return

        let lenis: InstanceType<typeof Lenis> | null = null
        let raf: ((time: number) => void) | null = null
        if (!window.matchMedia("(pointer: coarse)").matches) {
          // Index links glide to their card and stop clear of the top edge.
          lenis = new Lenis({ lerp: 0.09, autoRaf: false, anchors: { offset: -128 } })
          lenis.on("scroll", ScrollTrigger.update)
          raf = (time) => lenis?.raf(time * 1000)
          gsap.ticker.add(raf)
          gsap.ticker.lagSmoothing(0)
        }

        const ctx = gsap.context(() => {
          const mm = gsap.matchMedia()
          mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (context) => {
            const desktop = Boolean(context.conditions?.desktop)

            for (const group of gsap.utils.toArray<HTMLElement>("[data-reveal-group]")) {
              // A group not drawn at this width (display: none) gets nothing: a trigger at 0
              // would fire and kill itself mid-refresh.
              if (!group.getClientRects().length) continue
              const rules = gsap.utils.toArray<HTMLElement>(group.querySelectorAll("[data-rule]"))
              const rises = gsap.utils.toArray<HTMLElement>(group.querySelectorAll("[data-reveal]"))
              if (!rules.length && !rises.length) continue
              const tl = gsap.timeline({ paused: true })
              if (rules.length) {
                gsap.set(rules, { scaleX: 0, transformOrigin: "0% 50%" })
                tl.to(rules, { scaleX: 1, duration: 0.8, ease: REVEAL_EASE, stagger: 0.07 }, 0)
              }
              if (rises.length) {
                gsap.set(rises, { opacity: 0, y: desktop ? 16 : 12 })
                tl.to(rises, { opacity: 1, y: 0, duration: 0.7, ease: REVEAL_EASE, stagger: 0.07, clearProps: "transform" }, 0.05)
              }
              // Played once, never reversed; the trigger stays (not `once`) so a refresh
              // never removes triggers from under itself.
              ScrollTrigger.create({ trigger: group, start: "top 80%", onEnter: () => tl.play() })
            }

            const travel = desktop ? 5 : 3
            for (const frame of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
              if (!frame.getClientRects().length) continue
              const inner = frame.querySelector<HTMLElement>("[data-parallax-inner]")
              if (!inner) continue
              gsap.fromTo(
                inner,
                { yPercent: -travel },
                { yPercent: travel, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
              )
            }
          })
        })

        // Fonts and late images change heights; measure again once they settle.
        void document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh())

        cleanup = () => {
          ctx.revert()
          if (raf) gsap.ticker.remove(raf)
          lenis?.destroy()
        }
      })
      .catch(() => {
        // Never leave a start state behind: show everything as authored.
        document.querySelectorAll<HTMLElement>("[data-reveal], [data-rule]").forEach((el) => {
          el.style.opacity = ""
          el.style.transform = ""
        })
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return null
}
