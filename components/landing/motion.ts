"use client"

import { useEffect, useRef, type RefObject } from "react"

export type Gsap = typeof import("gsap").gsap
export type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger
type Libs = { gsap: Gsap; ScrollTrigger: ScrollTriggerStatic }

/** The landing's one easing for reveals: GSAP's match for cubic-bezier(0.22, 1, 0.36, 1) (§6.1). */
export const REVEAL_EASE = "power4.out"

let libs: Promise<Libs> | null = null

/** GSAP and ScrollTrigger, fetched once on demand and shared by every landing section. */
export function loadMotion() {
  libs ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger)
    return { gsap, ScrollTrigger }
  })
  return libs
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Landing-only motion (DESIGN_SYSTEM.md §6.1). `build` runs inside one `gsap.context()`
 * scoped to `scope` and is reverted on unmount. With reduced motion, or if the library
 * fails to load, `build` never runs and `settle` is called instead so the caller can show
 * the finished state. Nothing is hidden before `build` runs, so a page without scripts,
 * or with reduced motion, is complete.
 */
export function useLandingMotion(
  scope: RefObject<HTMLElement | null>,
  build: (gsap: Gsap, ScrollTrigger: ScrollTriggerStatic) => void | (() => void),
  settle?: () => void,
) {
  const buildRef = useRef(build)
  const settleRef = useRef(settle)
  useEffect(() => {
    buildRef.current = build
    settleRef.current = settle
  })

  useEffect(() => {
    const el = scope.current
    if (!el) return
    if (prefersReducedMotion()) {
      settleRef.current?.()
      return
    }

    let cancelled = false
    let ctx: { revert: () => void } | undefined

    loadMotion()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        ctx = gsap.context(() => buildRef.current(gsap, ScrollTrigger), el)
      })
      .catch(() => {
        if (!cancelled) settleRef.current?.()
      })

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [scope])
}
