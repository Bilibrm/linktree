"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { animated, useSpring } from "@react-spring/web"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { ParallaxHero } from "./parallax-hero"
import { CraftSteps } from "./craft-steps"
import { BlockBento } from "./block-bento"
import { ThemeStage } from "./theme-stage"
import { PowerSection } from "./power-section"
import { Slide, SlideDeck, SlideDots } from "./slide-deck"
import { useMagnetic } from "./hooks/use-magnetic"
import { MotionProfileProvider } from "./hooks/use-motion-profile"
import { SlideItem } from "./slide-motion"

/** Hero + craft×2 + bento + theme + power + faq + cta */
const SLIDE_COUNT = 8

const faqs = [
  { q: "Is LinkNest free?", a: "Yes. Every feature is free. No premium tier, no paywall." },
  { q: "Can I use my own domain?", a: "Not yet — on the roadmap. Today: linknest.app/yourusername." },
  { q: "Do you track my visitors?", a: "Clicks and views only — numbers, not people. No cookies, no PII." },
  { q: "Can I export my data?", a: "Yes. Export blocks and settings from the dashboard anytime." },
  { q: "What block types are available?", a: "Links, headers, text, social, images, galleries, embeds, forms, countdowns, dividers." },
  { q: "Is this open source?", a: "Yes. Public codebase — self-host, contribute, or just read it." },
]

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight)
  }, [a, open])

  const spring = useSpring({
    maxHeight: open ? height : 0,
    opacity: open ? 1 : 0,
    rotate: open ? 45 : 0,
    config: { tension: 280, friction: 24 },
  })

  return (
    <div className="border-b border-white/10">
      <button type="button" onClick={onToggle} className="group flex min-h-11 w-full items-center justify-between py-3 text-left">
        <span className="pr-4 text-caption font-medium text-bone group-hover:text-gold md:text-body">{q}</span>
        <animated.span style={{ rotate: spring.rotate }} className="shrink-0 text-lg text-gold">
          +
        </animated.span>
      </button>
      <animated.div style={{ maxHeight: spring.maxHeight, opacity: spring.opacity }} className="overflow-hidden">
        <div ref={contentRef}>
          <p className="pb-3 text-caption leading-relaxed text-bone/75">{a}</p>
        </div>
      </animated.div>
    </div>
  )
}

export function LandingContent() {
  const heroCtaRef = useRef<HTMLAnchorElement>(null)
  const finalCtaRef = useRef<HTMLAnchorElement>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [slideIndex, setSlideIndex] = useState(0)
  const [deckProgress, setDeckProgress] = useState(0)

  const finalMagnetic = useMagnetic(finalCtaRef, 0.32)

  const onProgress = useCallback((progress: number, index: number) => {
    setDeckProgress(progress)
    setSlideIndex(index)
  }, [])

  const navSpring = useSpring({
    opacity: deckProgress > 0.02 || slideIndex > 0 ? 1 : 0,
    y: deckProgress > 0.02 || slideIndex > 0 ? 0 : -16,
    config: { tension: 280, friction: 28 },
  })

  return (
    <MotionProfileProvider>
    <div className="relative h-dvh overflow-hidden bg-ink font-body text-bone">
      <animated.nav style={navSpring} className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-center px-4 pt-3">
        <div className="pointer-events-auto mx-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-surface/80 px-4 py-2 backdrop-blur-xl sm:px-5">
          <Link href="/" className="inline-flex min-h-11 items-center">
            <img src="/logo.svg" alt="LinkNest" className="h-5" />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/auth/login" className="inline-flex min-h-11 items-center px-3 text-caption text-bone/75 hover:text-bone">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gold px-3.5 text-caption font-semibold text-ink hover:opacity-90"
            >
              Start your page
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </animated.nav>

      <SlideDots count={SLIDE_COUNT} active={Math.min(slideIndex, SLIDE_COUNT - 1)} />

      <SlideDeck onProgress={onProgress}>
        <ParallaxHero heroCtaRef={heroCtaRef} asSlide />

        <CraftSteps />

        <Slide>
          <BlockBento embedded />
        </Slide>

        <Slide>
          <ThemeStage embedded />
        </Slide>

        <Slide id="power">
          <PowerSection embedded />
        </Slide>

        <Slide>
          <div className="grid gap-6 md:grid-cols-[0.75fr_1.25fr] md:items-start md:gap-10">
            <div>
              <SlideItem index={0} from="left">
                <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Questions</p>
              </SlideItem>
              <SlideItem index={1} from="up">
                <h2 className="mt-2 font-display text-[clamp(2rem,4vw,2.85rem)] font-black leading-[1.05] text-bone">
                  Straight answers.
                </h2>
              </SlideItem>
              <SlideItem index={2} from="up">
                <p className="mt-3 max-w-xs text-caption leading-relaxed text-bone/70 md:text-body">
                  Free forever, open source, and privacy-first. Tap a question.
                </p>
              </SlideItem>
            </div>
            <SlideItem index={2} from="right">
              <div className="rounded-2xl border border-white/10 bg-surface/35 px-4 py-1 md:px-5">
                {faqs.map((faq, i) => (
                  <FaqItem
                    key={faq.q}
                    q={faq.q}
                    a={faq.a}
                    open={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </SlideItem>
          </div>
        </Slide>

        <Slide backdropVariant="cta">
          <div className="grid gap-6 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-10">
            <div className="hidden md:block">
              <SlideItem index={0} from="left">
                <p className="font-mono text-small uppercase tracking-[0.2em] text-gold">Last step</p>
              </SlideItem>
              <SlideItem index={1} from="up">
                <p className="mt-4 max-w-sm font-display text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-tight text-bone/90">
                  One page. Every link. Yours to keep.
                </p>
              </SlideItem>
            </div>
            <SlideItem index={1} from="scale">
              <div className="w-full rounded-[1.75rem] border border-white/12 bg-ink/75 px-6 py-8 backdrop-blur-md md:px-9 md:py-10">
                <h2 className="font-display text-[clamp(2.1rem,4vw,3.25rem)] font-black leading-[0.95] text-bone">
                  Your page is waiting.
                </h2>
                <p className="mb-7 mt-4 max-w-sm text-body leading-relaxed text-bone/80">
                  Free to start. Open source. No data collection. Just your corner of the web.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <animated.div style={{ x: finalMagnetic.x, y: finalMagnetic.y }}>
                    <Link
                      ref={finalCtaRef}
                      href="/auth/signup"
                      className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-6 py-3 text-caption font-semibold text-ink hover:opacity-90 active:scale-[0.97]"
                    >
                      Start your page
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </animated.div>
                  <Link
                    href="/auth/login"
                    className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-6 py-3 text-caption text-bone/80 hover:border-white/35 hover:text-bone"
                  >
                    Sign in
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                  <img src="/logo.svg" alt="LinkNest" className="h-4 opacity-80" />
                  <Link href="/privacy" className="text-caption text-bone/60 hover:text-bone">
                    Privacy
                  </Link>
                </div>
              </div>
            </SlideItem>
          </div>
        </Slide>
      </SlideDeck>
    </div>
    </MotionProfileProvider>
  )
}
