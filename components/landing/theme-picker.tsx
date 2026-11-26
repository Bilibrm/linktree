"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { fontHref, pickableThemes, resolveThemeId } from "@/lib/themes"
import { ThemeThumb } from "@/components/page/theme-thumb"
import { useThemeFonts } from "@/components/page/theme-fonts"
import { cn } from "@/lib/utils"
import { Proof } from "./proof"
import { pickerBlocks, samplePerson, thumbBlocks } from "./sample-page"

const THUMB_TEXT = [samplePerson.name, ...thumbBlocks.map((b) => String(b.data.title ?? b.data.label ?? ""))].join(" ")

/**
 * "Make it yours" below 1024px: the real themes from the Look panel, applied live to a
 * proof. The proof comes first; under it the themes sit in one strip that scrolls
 * sideways, each a tiny proof. Native radios, so arrow keys move between them.
 */
export function ThemePicker() {
  const [selected, setSelected] = useState("ticket-stub")
  const theme = useMemo(() => resolveThemeId(selected), [selected])
  const all = useMemo(() => pickableThemes.map((t) => resolveThemeId(t.id)), [])

  // Thumbnail fonts load once the picker is near the screen, cut down to the few glyphs shown.
  const ref = useRef<HTMLFieldSetElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "400px" })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  useThemeFonts(near ? all.map((t) => fontHref(t.font, THUMB_TEXT)) : [])

  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-center gap-4">
        <Proof
          key={theme.id}
          blocks={pickerBlocks}
          theme={theme}
          username={samplePerson.username}
          name={samplePerson.name}
          bio={samplePerson.bio}
          still={false}
        />
        <p className="type-small w-full max-w-[380px] text-ink-soft" aria-live="polite">
          <span className="font-semibold text-ink">{theme.name}.</span> {pickableThemes.find((t) => t.id === theme.id)?.blurb}
        </p>
      </div>

      <fieldset ref={ref} className="min-w-0">
        <legend className="type-small font-semibold text-ink">Pick a theme</legend>
        <div className="landing-strip -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pt-1 pb-4 sm:-mx-8 sm:px-8">
          {all.map((t) => {
            const active = t.id === selected
            return (
              <label key={t.id} className="group relative flex shrink-0 cursor-pointer flex-col gap-2">
                <input
                  type="radio"
                  name="landing-theme"
                  value={t.id}
                  checked={active}
                  onChange={() => setSelected(t.id)}
                  className="press-bare-input peer sr-only"
                />
                <span
                  className={cn(
                    "block w-fit overflow-hidden rounded-label border transition-[transform,border-color] duration-200 ease-press",
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink",
                    active ? "border-ink shadow-misregistered" : "border-rule-strong group-hover:-translate-y-0.5 group-hover:border-ink",
                  )}
                >
                  <ThemeThumb theme={t} header={{ name: samplePerson.name }} blocks={thumbBlocks} width={88} />
                </span>
                <span className={cn("type-small leading-tight", active ? "font-bold" : "font-semibold text-ink-soft group-hover:text-ink")}>{t.name}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
