"use client"

import { useEffect, useRef, useState } from "react"
import { animated, useSpring } from "@react-spring/web"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { PhoneMockup } from "./phone-mockup"
import { usePhoneTilt } from "./hooks/use-phone-tilt"
import { useMagnetic } from "./hooks/use-magnetic"
import { cn } from "@/lib/utils"
import { MagicReveal } from "./magic-reveal"
import { SlideActiveProvider } from "./slide-motion"
import { SlideBackdrop } from "./slide-backdrop"
import { useMotionProfile } from "./hooks/use-motion-profile"

type ParallaxHeroProps = {
  heroCtaRef: React.RefObject<HTMLAnchorElement | null>
  asSlide?: boolean
}

export function ParallaxHero({ heroCtaRef, asSlide = false }: ParallaxHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const heroInnerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)

  const { rotateX, rotateY } = usePhoneTilt(heroRef, heroInnerRef)
  const magnetic = useMagnetic(heroCtaRef, 0.28)

  const [{ contentY, opacity }, api] = useSpring(() => ({
    contentY: 0,
    opacity: 1,
    config: { tension: 120, friction: 28 },
  }))
  const profile = useMotionProfile()

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio > 0.45),
      { threshold: [0.45, 0.6] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (profile.reduceMotion) {
      api.start({ contentY: 0, opacity: 1, immediate: true })
      return
    }
    const el = heroRef.current
    if (!el) return
    const deck = el.closest("[data-slide-deck]") as HTMLElement | null
    if (!deck) return

    let raf = 0
    const drift = (profile.lowPower ? 22 : 40) * profile.intensity
    function update() {
      const rect = el!.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const offset = (viewH * 0.5 - (rect.top + rect.height * 0.5)) / viewH
      const clamped = Math.max(-1.2, Math.min(1.2, offset))
      api.start({
        contentY: clamped * -drift,
        opacity: active ? 1 : 0.55,
      })
    }
    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    deck.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      cancelAnimationFrame(raf)
      deck.removeEventListener("scroll", onScroll)
    }
  }, [active, api, profile.intensity, profile.lowPower, profile.reduceMotion])

  return (
    <section
      ref={heroRef}
      id="hero"
      className={cn(
        "relative flex h-dvh w-full shrink-0 items-center overflow-hidden px-5 pt-24 md:px-8 md:pt-10",
        asSlide && "snap-start snap-always"
      )}
    >
      <SlideBackdrop variant="hero" />

      <SlideActiveProvider active={active}>
        <animated.div
          ref={heroInnerRef}
          style={{ y: contentY, opacity }}
          className="relative z-20 mx-auto grid w-full max-w-6xl items-center gap-8 will-change-transform md:grid-cols-[1.15fr_0.85fr] md:gap-12"
        >
          <div className="text-center drop-shadow-[0_2px_20px_rgba(15,33,29,0.95)] md:text-left">
            <MagicReveal animation="twisterInUp" duration={0.7}>
              <p className="mb-4 font-mono text-small uppercase tracking-[0.22em] text-gold">01 / Your link in bio</p>
            </MagicReveal>
            <MagicReveal animation="puffIn" delay={0.08} duration={0.85}>
              <h1 className="font-display text-[clamp(3.25rem,9vw,6.75rem)] font-black leading-[0.86] tracking-tight text-bone">
                LinkNest
              </h1>
            </MagicReveal>
            <MagicReveal animation="puffIn" delay={0.2} duration={0.7}>
              <p className="mx-auto mt-5 max-w-md text-body leading-relaxed text-bone/80 md:mx-0">
                One page for every link, embed, and form you share — open source, free, and yours to shape.
              </p>
            </MagicReveal>
            <MagicReveal animation="swashIn" delay={0.32} duration={0.65}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <animated.div style={{ x: magnetic.x, y: magnetic.y }}>
                  <Link
                    ref={heroCtaRef}
                    href="/auth/signup"
                    className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-6 py-3 text-caption font-semibold text-ink transition-opacity hover:opacity-90 active:scale-[0.97]"
                  >
                    Start your page
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </animated.div>
                <a
                  href="#craft"
                  className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-6 py-3 text-caption text-bone/85 transition-colors hover:border-white/35 hover:text-bone"
                >
                  See how it works
                </a>
              </div>
            </MagicReveal>
          </div>

          <div className="hidden justify-center md:flex" style={{ perspective: 900 }}>
            <PhoneMockup style={{ rotateX, rotateY }} />
          </div>
        </animated.div>
      </SlideActiveProvider>

      <div className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2">
        <div className="flex h-8 w-5 justify-center rounded-full border border-white/15 pt-2">
          <div className="h-2 w-0.5 rounded-full bg-gold/70 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
