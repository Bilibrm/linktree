"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const AnalyticsChart = dynamic(() => import("./analytics-chart").then((m) => ({ default: m.AnalyticsChart })), { ssr: false })

gsap.registerPlugin(ScrollTrigger)

const waypoints = [
  { id: "signup", label: "01", title: "Pick a username", desc: "No email verification. No credit card. Just a name and you are live." },
  { id: "customize", label: "02", title: "Choose your look", desc: "Eight built-in themes. Every color, font, background — all yours to change." },
  { id: "publish", label: "03", title: "Drop in your blocks", desc: "Links, images, embeds, forms, countdowns. Ten block types. Drag to reorder." },
  { id: "grow", label: "04", title: "Watch what happens", desc: "Click tracking, views, referrers. Real numbers. No guesswork." },
]

const showcaseItems = [
  { label: "Link block", kind: "link" },
  { label: "Social icons", kind: "social" },
  { label: "Embed", kind: "embed" },
  { label: "Form", kind: "form" },
  { label: "Countdown", kind: "countdown" },
  { label: "Gallery", kind: "gallery" },
]

const stats = [
  { value: 10, suffix: "", label: "block types" },
  { value: 8, suffix: "", label: "built-in themes" },
  { value: 100, suffix: "%", label: "open source" },
]

const faqs = [
  { q: "Is LinkNest free?", a: "Yes. Every feature is free. No premium tier, no paywall. We fund development through optional donations." },
  { q: "Can I use my own domain?", a: "Not yet. Custom domain support is on the roadmap. Right now your page lives at linknest.app/yourusername." },
  { q: "Do you track my visitors?", a: "We track click events and page views — numbers, not people. No cookies, no PII, no cross-site tracking. Analytics are aggregate only." },
  { q: "Can I export my data?", a: "Yes. Your data is yours. Export your blocks and settings from the dashboard at any time." },
  { q: "What block types are available?", a: "Links, headers, text, dividers, social icons, images, galleries, embeds (YouTube, Spotify, TikTok), forms, and countdowns." },
  { q: "Is this open source?", a: "Yes. The full codebase is public. You can self-host, contribute, or just read the code." },
]

const comparisons = [
  { feature: "Theme customization", linknest: true, basic: false },
  { feature: "10 block types", linknest: true, basic: false },
  { feature: "Click analytics", linknest: true, basic: false },
  { feature: "Password-protected pages", linknest: true, basic: false },
  { feature: "Scheduling", linknest: true, basic: false },
  { feature: "Form submissions", linknest: true, basic: false },
  { feature: "Custom CSS injection", linknest: true, basic: false },
  { feature: "Open source", linknest: true, basic: false },
]

/** Pulls an element gently toward the cursor, springs back on leave. Skipped on touch devices. */
function useMagnetic(ref: React.RefObject<HTMLElement | null>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const relX = e.clientX - rect.left - rect.width / 2
      const relY = e.clientY - rect.top - rect.height / 2
      gsap.to(el, { x: relX * strength, y: relY * (strength + 0.15), duration: 0.4, ease: "power2.out" })
    }
    function handleLeave() {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" })
    }
    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)
    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
    }
  }, [ref, strength])
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const obj = { val: 0 }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: value,
          duration: 1.3,
          ease: "power2.out",
          onUpdate: () => {
            if (el) el.textContent = Math.round(obj.val) + suffix
          },
        })
      },
    })
    return () => st.kill()
  }, [value, suffix])

  return (
    <div className="text-center">
      <div className="font-display text-display-lg font-black text-gold leading-none">
        <span ref={numRef}>0{suffix}</span>
      </div>
      <div className="text-caption text-muted-foreground mt-2">{label}</div>
    </div>
  )
}

function PhoneMockup({ tiltRef, className = "" }: { tiltRef?: React.RefObject<HTMLDivElement | null>; className?: string }) {
  return (
    <div ref={tiltRef} className={`w-[240px] sm:w-[260px] rounded-[2.25rem] border border-white/10 bg-surface p-3 shadow-2xl shadow-black/40 ${className}`} style={{ transformStyle: "preserve-3d" }}>
      <div className="rounded-[1.6rem] bg-ink border border-white/5 p-5 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center font-display font-bold text-ink text-sm mb-3">A</div>
        <div className="h-2.5 w-20 rounded-full bg-white/10 mb-1.5" />
        <div className="h-2 w-14 rounded-full bg-white/5 mb-4" />
        <div className="w-full space-y-2">
          <div className="h-9 w-full rounded-xl bg-gold/90 flex items-center px-3 text-[10px] font-semibold text-ink">Latest project</div>
          <div className="h-9 w-full rounded-xl border border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">Book a call</div>
          <div className="h-9 w-full rounded-xl border border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">Newsletter</div>
        </div>
        <div className="flex gap-2 mt-4">
          {["ig", "x", "yt"].map((s) => (
            <div key={s} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[8px] text-muted-foreground">{s}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LandingContent() {
  const container = useRef<HTMLDivElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const topo1Ref = useRef<HTMLDivElement>(null)
  const topo2Ref = useRef<HTMLDivElement>(null)
  const topo3Ref = useRef<HTMLDivElement>(null)
  const markerRefs = useRef<(HTMLDivElement | null)[]>([])
  const waypointSectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const navRef = useRef<HTMLElement>(null)

  const heroRef = useRef<HTMLElement>(null)
  const heroInnerRef = useRef<HTMLDivElement>(null)
  const heroPhoneRef = useRef<HTMLDivElement>(null)
  const heroPhoneWrapRef = useRef<HTMLDivElement>(null)
  const heroCtaRef = useRef<HTMLAnchorElement>(null)
  const finalCtaRef = useRef<HTMLAnchorElement>(null)

  const showcaseSectionRef = useRef<HTMLElement>(null)
  const showcaseTrackRef = useRef<HTMLDivElement>(null)

  const [previewTheme, setPreviewTheme] = useState({ name: "Forest", bg: "#0F211D", card: "#17332C", text: "#E7DFC9", accent: "#D2A24C" })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useMagnetic(heroCtaRef, 0.3)
  useMagnetic(finalCtaRef, 0.35)

  const setMarkerRef = (i: number) => (el: HTMLDivElement | null) => { markerRefs.current[i] = el }
  const setWaypointSectionRef = (i: number) => (el: HTMLDivElement | null) => { waypointSectionRefs.current[i] = el }

  // Hero phone tilt, driven by cursor position within the hero
  useEffect(() => {
    const heroEl = heroRef.current
    const phone = heroPhoneRef.current
    if (!heroEl || !phone) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(max-width: 767px)").matches) return

    let rafId: number
    let targetX = 0.5
    let targetY = 0.5
    let currentX = 0.5
    let currentY = 0.5

    function handleMouse(e: MouseEvent) {
      const rect = heroEl!.getBoundingClientRect()
      targetX = (e.clientX - rect.left) / rect.width
      targetY = (e.clientY - rect.top) / rect.height
    }
    function animate() {
      currentX += (targetX - currentX) * 0.07
      currentY += (targetY - currentY) * 0.07
      gsap.set(phone, {
        rotateY: (currentX - 0.5) * 18,
        rotateX: (0.5 - currentY) * 12,
        transformPerspective: 900,
      })
      rafId = requestAnimationFrame(animate)
    }
    heroEl.addEventListener("mousemove", handleMouse)
    rafId = requestAnimationFrame(animate)
    return () => {
      heroEl.removeEventListener("mousemove", handleMouse)
      cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const path = trailRef.current
    if (!path) return

    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const mm = gsap.matchMedia()

    const ctx = gsap.context(() => {
      const ease = "power3.out"

      // Hero load-in
      const tl = gsap.timeline({ defaults: { ease, overwrite: "auto" } })
      tl.fromTo(".hero-label", { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 })
        .fromTo(".hero-line", { y: 80, opacity: 0, rotateX: 12 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.1 }, "-=0.35")
        .fromTo(".hero-desc", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.6")
        .fromTo(".hero-actions", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
        .fromTo(heroPhoneWrapRef.current, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1 }, "-=0.9")

      if (!reduceMotion) {
        mm.add("(min-width: 768px)", () => {
          // Deeper multi-layer parallax across the whole page
          const topoLayers = [
            { el: topo1Ref.current, speed: 110 },
            { el: topo2Ref.current, speed: 190 },
            { el: topo3Ref.current, speed: 60 },
          ].filter((l) => l.el)

          topoLayers.forEach(({ el, speed }) => {
            ScrollTrigger.create({
              trigger: container.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 2,
              onUpdate: (self) => {
                if (el) gsap.set(el, { y: -self.progress * speed, willChange: "transform" })
              },
            })
          })

          // Trail line draw + waypoint markers
          const trailST = ScrollTrigger.create({
            trigger: container.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            onUpdate: (self) => {
              gsap.set(path, { strokeDashoffset: length * (1 - self.progress) })
            },
          })
          void trailST

          waypoints.forEach((_, i) => {
            const startFraction = i / waypoints.length
            const endFraction = (i + 1) / waypoints.length
            ScrollTrigger.create({
              trigger: container.current,
              start: `top +=${startFraction * 100}%`,
              end: `top +=${endFraction * 100}%`,
              scrub: 1,
              onUpdate: (self) => {
                const marker = markerRefs.current[i]
                if (marker) {
                  gsap.set(marker, {
                    backgroundColor: gsap.utils.interpolate("#17332C", "#D2A24C", self.progress),
                    scale: gsap.utils.interpolate(1, 1.35, self.progress),
                  })
                }
              },
              onLeave: () => {
                const marker = markerRefs.current[i]
                if (marker) gsap.set(marker, { backgroundColor: "#D2A24C", scale: 1 })
              },
            })

            ScrollTrigger.create({
              trigger: `.waypoint-section-${i}`,
              start: "top 75%",
              end: "top 35%",
              scrub: 1.2,
              onUpdate: (self) => {
                const card = document.querySelector(`.waypoint-card-${i}`) as HTMLElement
                if (card) {
                  gsap.set(card, {
                    y: gsap.utils.interpolate(50, 0, self.progress),
                    opacity: gsap.utils.interpolate(0, 1, self.progress),
                    filter: `blur(${gsap.utils.interpolate(4, 0, self.progress)}px)`,
                  })
                }
              },
            })
          })

          // Pinned hero: scales, blurs, and fades out as the next section arrives
          if (heroRef.current && heroInnerRef.current) {
            ScrollTrigger.create({
              trigger: heroRef.current,
              start: "top top",
              end: "+=85%",
              pin: true,
              pinSpacing: true,
              scrub: 1,
              onUpdate: (self) => {
                gsap.set(heroInnerRef.current, {
                  scale: 1 - self.progress * 0.1,
                  opacity: 1 - self.progress,
                  filter: `blur(${self.progress * 6}px)`,
                })
                if (heroPhoneWrapRef.current) {
                  gsap.set(heroPhoneWrapRef.current, {
                    scale: 1 - self.progress * 0.06,
                    opacity: 1 - self.progress,
                    y: -self.progress * 30,
                  })
                }
              },
            })
          }

          // Horizontal scroll-jacked block showcase
          if (showcaseSectionRef.current && showcaseTrackRef.current) {
            const track = showcaseTrackRef.current
            const getDistance = () => Math.max(track.scrollWidth - window.innerWidth + 96, 0)
            ScrollTrigger.create({
              trigger: showcaseSectionRef.current,
              start: "top top",
              end: () => `+=${getDistance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(track, { x: -getDistance() * self.progress })
              },
            })
          }
        })

        mm.add("(max-width: 767px)", () => {
          gsap.utils.toArray<HTMLElement>(".waypoint-card").forEach((card, i) => {
            ScrollTrigger.create({
              trigger: card,
              start: "top 85%",
              onEnter: () => gsap.to(card, { y: 0, opacity: 1, duration: 0.6, delay: i * 0.15, ease, clearProps: "y" }),
              once: true,
            })
          })
          gsap.utils.toArray<HTMLElement>(".showcase-mobile-card").forEach((card, i) => {
            ScrollTrigger.create({
              trigger: card,
              start: "top 88%",
              onEnter: () => gsap.to(card, { y: 0, opacity: 1, duration: 0.5, delay: i * 0.08, ease, clearProps: "y" }),
              once: true,
            })
          })
        })
      }

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 0.7, ease, clearProps: "y" }),
          once: true,
        })
      })

      gsap.fromTo(".chart-wrap", { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease,
        scrollTrigger: { trigger: ".chart-wrap", start: "top 80%", once: true },
      })
      gsap.fromTo(".theme-grid > *", { y: 25, opacity: 0, scale: 0.95 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.5, ease, stagger: 0.08,
        scrollTrigger: { trigger: ".theme-grid", start: "top 80%", once: true },
      })
      gsap.fromTo(".comparison-block", { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease,
        scrollTrigger: { trigger: ".comparison-block", start: "top 82%", once: true },
      })
      gsap.fromTo(".faq-item", { y: 25, opacity: 0, scale: 0.98 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.5, ease, stagger: 0.08,
        scrollTrigger: { trigger: ".faq-item", start: "top 88%", once: true },
      })
      gsap.fromTo(".cta-block", { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease,
        scrollTrigger: { trigger: ".cta-block", start: "top 82%", once: true },
      })

      ScrollTrigger.create({
        trigger: container.current,
        start: "top top",
        onUpdate: (self) => {
          if (navRef.current) {
            if (self.progress > 0.03) gsap.to(navRef.current, { y: 0, opacity: 1, duration: 0.3, overwrite: "auto" })
            else gsap.to(navRef.current, { y: -20, opacity: 0, duration: 0.3, overwrite: "auto" })
          }
        },
      })
    }, container)

    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      clearTimeout(refreshTimer)
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <div ref={container} className="relative bg-ink text-bone font-body overflow-x-hidden min-h-screen">

      <div ref={topo1Ref} className="absolute inset-0 pointer-events-none select-none overflow-hidden will-change-transform">
        <svg className="w-full h-full opacity-[0.035]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[60, 140, 220, 300, 380, 460, 540, 620, 700].map((y) => (
            <path key={y} d={`M0,${y} Q120,${y - 20} 240,${y} T480,${y} T720,${y} T960,${y} T1200,${y} T1440,${y}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
          ))}
        </svg>
      </div>
      <div ref={topo2Ref} className="absolute inset-0 pointer-events-none select-none overflow-hidden will-change-transform">
        <svg className="w-full h-full opacity-[0.025]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[30, 100, 170, 250, 330, 410, 490, 570, 650, 730].map((y) => (
            <path key={y} d={`M0,${y} Q200,${y + 15} 400,${y} T800,${y} T1200,${y} T1440,${y}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
          ))}
        </svg>
      </div>
      <div ref={topo3Ref} className="absolute inset-0 pointer-events-none select-none overflow-hidden will-change-transform">
        <svg className="w-full h-full opacity-[0.02]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[10, 90, 160, 240, 330].map((y) => (
            <path key={y} d={`M0,${y} Q300,${y - 25} 600,${y} T1200,${y} T1440,${y}`} fill="none" stroke="currentColor" className="text-gold" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      <div className="fixed top-0 left-0 h-full w-16 md:w-20 z-30 pointer-events-none hidden md:block will-change-transform">
        <svg className="w-full h-full" viewBox="0 0 80 2000" preserveAspectRatio="xMidYMax slice">
          <path ref={trailRef} d="M40,0 Q60,200 40,400 T40,800 T40,1200 T40,1600 T40,2000" fill="none" stroke="currentColor" className="text-gold" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex flex-col items-center gap-0">
          {waypoints.map((w, i) => (
            <div key={w.id} ref={setMarkerRef(i)} className="w-3 h-3 rounded-full border-2 border-gold/60" style={{ backgroundColor: "#17332C", marginTop: i === 0 ? "18vh" : "0", flex: "1", minHeight: "4rem" }} />
          ))}
        </div>
      </div>

      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-3 opacity-0" style={{ y: -20 }}>
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-5 py-2.5 rounded-full bg-surface/70 backdrop-blur-xl border border-white/5">
          <img src="/logo.svg" alt="LinkNest" className="h-5" />
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-caption text-muted-foreground hover:text-bone transition-colors px-3 py-1.5">Log in</Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-1.5 rounded-full bg-gold text-ink px-3.5 py-1.5 text-caption font-semibold hover:opacity-90 transition-all">Start your page<ArrowRight className="w-3 h-3" /></Link>
          </div>
        </div>
      </nav>

      {/* HERO — pins and dissolves into the next section on scroll */}
      <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center justify-center px-6 pt-24 md:pt-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/60 to-ink pointer-events-none z-10" />
        <div ref={heroInnerRef} className="relative z-20 w-full max-w-6xl mx-auto grid md:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="hero-label inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-small tracking-widest font-medium text-muted-foreground mb-8">A path people follow to find you</div>
            <h1 className="hero-line font-display text-display-xl md:text-[clamp(3.5rem,7vw,6.5rem)] font-black text-bone leading-[0.9]" style={{ perspective: 600 }}>
              Your trail
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-coral">starts here</span>
            </h1>
            <p className="hero-desc mt-6 text-body text-muted-foreground max-w-lg mx-auto md:mx-0 leading-relaxed">
              One page that gathers everything you share — links, media, forms — and shows you what gets clicked.
              No templates. No paywall. Just your corner of the web.
            </p>
            <div className="hero-actions mt-10 flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <Link ref={heroCtaRef} href="/auth/signup" className="group inline-flex items-center gap-2 rounded-full bg-gold text-ink px-6 py-3 text-caption font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]">
                Start your page<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how" className="inline-flex items-center rounded-full border border-white/10 px-6 py-3 text-caption text-muted-foreground hover:text-bone hover:border-white/20 transition-all">See how it works</a>
            </div>
          </div>
          <div ref={heroPhoneWrapRef} className="hidden md:flex justify-center" style={{ perspective: 1000 }}>
            <PhoneMockup tiltRef={heroPhoneRef} />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-2">
            <div className="w-0.5 h-2 rounded-full bg-gold/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="relative px-6 py-20 md:py-28 max-w-4xl mx-auto">
        <div className="reveal grid grid-cols-3 gap-4" style={{ y: 30, opacity: 0 }}>
          {stats.map((s) => (
            <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — staggered waypoints */}
      <section id="how" className="relative px-6 py-32 md:py-48 max-w-4xl mx-auto">
        <div className="md:pl-24">
          <span className="text-small uppercase tracking-widest font-semibold text-gold mb-4 block">The trail begins</span>
          <h2 className="font-display text-display-lg md:text-display-xl font-black text-bone leading-[1.05]">Four steps,<br />no fluff.</h2>
        </div>
        <div className="mt-16 md:pl-24 relative">
          <div className="absolute left-[2.5rem] top-0 bottom-0 w-px bg-white/5 hidden md:block" />
          <div className="space-y-20 md:space-y-32">
            {waypoints.map((w, i) => {
              const isRight = i % 2 === 0
              return (
                <div key={w.id} ref={setWaypointSectionRef(i)} className={`waypoint-section-${i} relative`}>
                  <div className={`waypoint-card waypoint-card-${i}`}>
                    <div className="absolute left-[2.125rem] top-1 w-2.5 h-2.5 rounded-full border-2 border-gold/60 bg-surface z-10 hidden md:block" />
                    <div className={`md:max-w-md ${isRight ? "" : "md:ml-auto md:pl-8 md:text-right"}`}>
                      <span className="text-display font-bold text-gold/60 font-mono">{w.label}</span>
                      <h3 className="font-display text-display md:text-[1.75rem] font-bold text-bone mt-1 leading-tight">{w.title}</h3>
                      <p className="text-body text-muted-foreground mt-3 leading-relaxed">{w.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* BLOCK SHOWCASE — horizontal scroll-jacked gallery on desktop, stacked cards on mobile */}
      <section ref={showcaseSectionRef} className="hidden md:flex relative flex-col justify-center min-h-screen overflow-hidden px-6 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface/10 to-transparent pointer-events-none" />
        <div className="relative mb-12">
          <span className="text-small uppercase tracking-widest font-semibold text-gold mb-4 block">Block showcase</span>
          <h2 className="font-display text-display-lg font-black text-bone leading-[1.05]">Ten ways to fill your page.</h2>
        </div>
        <div className="relative overflow-hidden">
          <div ref={showcaseTrackRef} className="flex gap-6" style={{ width: "max-content" }}>
            {showcaseItems.map((item) => (
              <div key={item.kind} className="w-[300px] flex-shrink-0 rounded-2xl border border-white/5 bg-surface/50 p-6">
                <span className="text-small font-mono text-muted-foreground mb-4 block">{item.label}</span>
                {item.kind === "link" && (
                  <div className="w-full h-12 rounded-xl bg-gold text-ink flex items-center px-5 font-semibold text-caption">Check out my latest project</div>
                )}
                {item.kind === "social" && (
                  <div className="flex gap-3">{["ig", "x", "yt", "tt", "gh"].map((s) => <div key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-small font-mono text-muted-foreground">{s}</div>)}</div>
                )}
                {item.kind === "embed" && (
                  <div className="w-full aspect-video rounded-lg bg-ink border border-white/5 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-coral border-y-[7px] border-y-transparent ml-0.5" />
                    </div>
                  </div>
                )}
                {item.kind === "form" && (
                  <div className="space-y-2">
                    <div className="h-9 rounded-lg bg-ink border border-white/5 px-3 flex items-center text-small text-muted-foreground/40">Your email</div>
                    <div className="h-9 rounded-lg bg-gold text-ink flex items-center justify-center text-small font-semibold">Subscribe</div>
                  </div>
                )}
                {item.kind === "countdown" && (
                  <div className="flex justify-center gap-2">
                    {["06", "22", "14", "55"].map((v, i) => (
                      <div key={i} className="text-center">
                        <div className="w-10 h-10 rounded-lg bg-ink border border-white/5 flex items-center justify-center text-caption font-bold text-gold font-mono">{v}</div>
                      </div>
                    ))}
                  </div>
                )}
                {item.kind === "gallery" && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-square rounded-lg bg-ink border border-white/5" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile fallback: simple stacked showcase, no scroll-jacking */}
      <section className="md:hidden relative px-6 py-24">
        <div className="reveal mb-8" style={{ y: 30, opacity: 0 }}>
          <span className="text-small uppercase tracking-widest font-semibold text-gold mb-3 block">Block showcase</span>
          <h2 className="font-display text-display-lg font-black text-bone leading-[1.05]">Ten ways to fill your page.</h2>
        </div>
        <div className="space-y-4">
          <div className="showcase-mobile-card rounded-xl border border-white/5 bg-surface/50 p-5" style={{ opacity: 0, transform: "translateY(30px)" }}>
            <span className="text-small font-mono text-muted-foreground mb-3 block">Link block</span>
            <div className="w-full h-12 rounded-xl bg-gold text-ink flex items-center px-5 font-semibold text-caption">Check out my latest project</div>
          </div>
          <div className="showcase-mobile-card rounded-xl border border-white/5 bg-surface/50 p-5" style={{ opacity: 0, transform: "translateY(30px)" }}>
            <span className="text-small font-mono text-muted-foreground mb-3 block">Social icons</span>
            <div className="flex gap-3">{["ig", "x", "yt", "tt", "gh"].map((s) => <div key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-small font-mono text-muted-foreground">{s}</div>)}</div>
          </div>
          <div className="showcase-mobile-card rounded-xl border border-white/5 bg-surface/50 p-5" style={{ opacity: 0, transform: "translateY(30px)" }}>
            <span className="text-small font-mono text-muted-foreground mb-3 block">Form</span>
            <div className="space-y-2">
              <div className="h-9 rounded-lg bg-ink border border-white/5 px-3 flex items-center text-small text-muted-foreground/40">Your email</div>
              <div className="h-9 rounded-lg bg-gold text-ink flex items-center justify-center text-small font-semibold">Subscribe</div>
            </div>
          </div>
        </div>
      </section>

      {/* THEMING */}
      <section className="relative px-6 py-32 md:py-48 max-w-5xl mx-auto">
        <div className="reveal grid md:grid-cols-[1fr_auto] gap-10 items-start" style={{ y: 40, opacity: 0 }}>
          <div>
            <span className="text-small uppercase tracking-widest font-semibold text-gold mb-4 block">Theming</span>
            <h2 className="font-display text-display-lg font-black text-bone leading-[1.05] mb-10">Pick a look.</h2>
            <div className="theme-grid flex flex-wrap gap-3 mb-6">
              {[
                { name: "Forest", bg: "#0F211D", card: "#17332C", text: "#E7DFC9", accent: "#D2A24C" },
                { name: "Parchment", bg: "#E7DFC9", card: "#ECE6D6", text: "#16302A", accent: "#D2A24C" },
                { name: "Ember", bg: "#1A0F0C", card: "#241712", text: "#F0E6D3", accent: "#DD5B39" },
                { name: "Mist", bg: "#162822", card: "#1C332C", text: "#D4E0DA", accent: "#6B9E8C" },
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => setPreviewTheme(t)}
                  className={`px-4 py-2 rounded-full text-caption font-medium border transition-all ${previewTheme.name === t.name ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-muted-foreground hover:text-bone"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <p className="text-body text-muted-foreground max-w-sm leading-relaxed">Every color, font pairing, button shape, and hover style is yours to set — the preview updates instantly.</p>
          </div>
          <div className="rounded-[2.25rem] border border-white/10 bg-surface p-3 shadow-2xl shadow-black/40 mx-auto">
            <div
              className="rounded-[1.6rem] p-8 w-[240px] transition-colors duration-700"
              style={{ backgroundColor: previewTheme.bg }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-bold mb-4 transition-colors duration-500" style={{ backgroundColor: previewTheme.card, color: previewTheme.accent }}>A</div>
              <div className="space-y-3">
                <div className="h-4 rounded-full transition-all duration-500" style={{ backgroundColor: previewTheme.card, width: "70%" }} />
                <div className="h-4 rounded-full transition-all duration-500" style={{ backgroundColor: previewTheme.card, width: "50%" }} />
                <div className="h-10 rounded-xl mt-4 transition-all duration-500" style={{ backgroundColor: previewTheme.accent }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <section className="relative px-6 py-32 md:py-48 max-w-3xl mx-auto">
        <div className="reveal" style={{ y: 40, opacity: 0 }}>
          <span className="text-small uppercase tracking-widest font-semibold text-gold mb-4 block">Analytics</span>
          <h2 className="font-display text-display-lg font-black text-bone leading-[1.05] mb-4">Know which links work.</h2>
          <p className="text-body text-muted-foreground max-w-md mb-10 leading-relaxed">Click tracking, page views, referrer data. No PII — just the numbers that help you make better content.</p>
          <div className="chart-wrap rounded-xl border border-white/5 bg-surface/30 p-4 md:p-6">
            <AnalyticsChart />
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="relative px-6 py-32 md:py-48 max-w-3xl mx-auto">
        <div className="comparison-block" style={{ y: 40, opacity: 0 }}>
          <span className="text-small uppercase tracking-widest font-semibold text-gold mb-4 block">Why not just a list of links?</span>
          <h2 className="font-display text-display-lg font-black text-bone leading-[1.05] mb-10">LinkNest vs. a basic link page.</h2>
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] text-caption font-mono">
              <div className="px-5 py-3 border-b border-white/5 text-muted-foreground" />
              <div className="px-5 py-3 border-b border-white/5 text-gold font-semibold text-center">LinkNest</div>
              <div className="px-5 py-3 border-b border-white/5 text-muted-foreground/50 text-center">Basic</div>
              {comparisons.map((c, i) => (
                <div key={c.feature} className="contents">
                  <div className={`px-5 py-3 ${i < comparisons.length - 1 ? "border-b border-white/5" : ""} text-bone`}>{c.feature}</div>
                  <div className={`px-5 py-3 ${i < comparisons.length - 1 ? "border-b border-white/5" : ""} text-center text-gold`}>{c.linknest ? "✓" : "—"}</div>
                  <div className={`px-5 py-3 ${i < comparisons.length - 1 ? "border-b border-white/5" : ""} text-center text-muted-foreground/30`}>{c.basic ? "✓" : "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-32 md:py-48 max-w-2xl mx-auto">
        <div className="mb-12">
          <span className="text-small uppercase tracking-widest font-semibold text-gold mb-4 block">Questions</span>
          <h2 className="font-display text-display-lg font-black text-bone leading-[1.05]">Common questions.</h2>
        </div>
        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item border-b border-white/5" style={{ y: 25, opacity: 0 }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left group">
                <span className="text-body font-medium text-bone group-hover:text-gold transition-colors duration-200">{faq.q}</span>
                <span className={`text-gold text-xl transition-all duration-300 ${openFaq === i ? "rotate-45 text-coral" : ""}`}>+</span>
              </button>
              <div className="overflow-hidden transition-all duration-400 ease-out-quart" style={{ maxHeight: openFaq === i ? "200px" : "0", opacity: openFaq === i ? 1 : 0 }}>
                <p className="text-body text-muted-foreground pb-5 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32 md:py-48 max-w-3xl mx-auto text-center">
        <div className="cta-block">
          <h2 className="font-display text-display-lg md:text-display-xl font-black text-bone leading-[0.95] mb-4">Your trail is waiting.</h2>
          <p className="text-body text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">Free to start. Open source. No data collection. Just your corner of the web.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link ref={finalCtaRef} href="/auth/signup" className="group inline-flex items-center gap-2 rounded-full bg-gold text-ink px-6 py-3 text-caption font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]">Start your page<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
            <Link href="/auth/login" className="inline-flex items-center rounded-full border border-white/10 px-6 py-3 text-caption text-muted-foreground hover:text-bone transition-all">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/logo.svg" alt="LinkNest" className="h-5" />
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-caption text-muted-foreground hover:text-bone transition-colors">Privacy</Link>
            <span className="text-caption text-muted-foreground">Open source. No tracking. No paywalls.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
