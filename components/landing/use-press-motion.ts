"use client"

import { useEffect, useRef, type RefObject } from "react"

type Gsap = typeof import("gsap").gsap
type ScrollTriggerStatic = typeof import("gsap/ScrollTrigger").ScrollTrigger

/**
 * Landing-only motion (DESIGN_SYSTEM.md §6). GSAP and ScrollTrigger are fetched on demand,
 * run inside one `gsap.context()` scoped to `scope`, and reverted on unmount.
 *
 * With reduced motion, or if the library fails to load, `build` never runs and `settle`
 * is called instead so the caller can show the finished state.
 */
export function usePressMotion(
  scope: RefObject<HTMLElement | null>,
  build: (gsap: Gsap, ScrollTrigger: ScrollTriggerStatic) => void,
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settleRef.current?.()
      return
    }

    let cancelled = false
    let ctx: { revert: () => void } | undefined

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger)
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
