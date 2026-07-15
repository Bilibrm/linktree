"use client"

import { useEffect, useRef, useState } from "react"
import { Parallax } from "react-parallax"
import { animated } from "@react-spring/web"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { landingImages } from "./landing-images"
import { PhoneMockup } from "./phone-mockup"
import { usePhoneTilt } from "./hooks/use-phone-tilt"
import { useMagnetic } from "./hooks/use-magnetic"
import { cn } from "@/lib/utils"
import { MagicReveal } from "./magic-reveal"
import { SlideActiveProvider } from "./slide-motion"

type ParallaxHeroProps = {
  heroCtaRef: React.RefObject<HTMLAnchorElement | null>
  asSlide?: boolean
}

export function ParallaxHero({ heroCtaRef, asSlide = false }: ParallaxHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const heroInnerRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [active, setActive] = useState(true)

  const { rotateX, rotateY } = usePhoneTilt(heroRef, heroInnerRef)
  const magnetic = useMagnetic(heroCtaRef, 0.28)

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

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

  const layers = [
    { src: landingImages.hero.back, strength: 180, blur: 2, position: landingImages.hero.positions.back },
    { src: landingImages.hero.mid, strength: 110, blur: 1, position: landingImages.hero.positions.mid },
    { src: landingImages.hero.front, strength: 50, blur: 0, position: landingImages.hero.positions.front },
  ]

  return (
    <section
      ref={heroRef}
      id="hero"
      className={cn(
        "relative flex h-dvh w-full shrink-0 items-center overflow-hidden px-5 pt-24 md:px-8 md:pt-10",
        asSlide && "snap-start snap-always"
      )}
    >
      <div className="absolute inset-0 z-0">
        {reduceMotion || isMobile ? (
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${landingImages.hero.back})`,
              backgroundPosition: landingImages.hero.positions.mobile,
            }}
          />
        ) : (
          layers.map((layer, i) => (
            <div key={i} className="absolute inset-0" style={{ zIndex: i }}>
              <Parallax
                bgImage={layer.src}
                bgImageAlt=""
                strength={layer.strength}
                blur={layer.blur}
                style={{ height: "100%" }}
                bgImageStyle={{ objectFit: "cover", objectPosition: layer.position }}
                className="h-full"
              >
                <div className="h-dvh" />
              </Parallax>
            </div>
          ))
        )}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-ink/50 via-ink/75 to-ink" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-full max-w-4xl bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
      </div>

      <SlideActiveProvider active={active}>
        <div
          ref={heroInnerRef}
          className="relative z-20 mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-12"
        >
          <div className="text-center drop-shadow-[0_2px_20px_rgba(15,33,29,0.95)] md:text-left">
            <MagicReveal animation="twisterInUp" duration={0.7}>
              <p className="mb-4 font-mono text-small uppercase tracking-[0.22em] text-gold">01 / Your trail online</p>
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
                  Walk the trail
                </a>
              </div>
            </MagicReveal>
          </div>

          <div className="hidden justify-center md:flex" style={{ perspective: 900 }}>
            <MagicReveal animation="vanishIn" delay={0.25} duration={0.8}>
              <PhoneMockup style={{ rotateX, rotateY }} />
            </MagicReveal>
          </div>
        </div>
      </SlideActiveProvider>

      <div className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2">
        <div className="flex h-8 w-5 justify-center rounded-full border border-white/15 pt-2">
          <div className="h-2 w-0.5 rounded-full bg-gold/70 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
