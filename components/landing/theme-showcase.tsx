"use client"

import { useMemo } from "react"
import { fontHref, pickableThemes, resolveThemeId } from "@/lib/themes"
import { ThemedPage } from "@/components/page/themed-page"
import { useThemeFonts } from "@/components/page/theme-fonts"
import { cn } from "@/lib/utils"
import { pickerBlocks, samplePerson, sampleText } from "./sample-page"
import { ThemePicker } from "./theme-picker"
import { useActiveItem } from "./use-active-item"

/**
 * "Make it yours" (DESIGN_SYSTEM.md §6.1, §8.1). On wide screens, a sticky split: the
 * title and the theme in the middle of the screen stay on the left, while every theme
 * glides past on the right as a full page in a clipped frame, its sheet drifting inside
 * the frame. Below 1024px, the picker: one proof first, the themes in a strip under it.
 * The other inks of the drawer (§3.1) only ever appear inside these frames.
 */
export function ThemeShowcase() {
  const all = useMemo(() => pickableThemes.map((t) => ({ theme: resolveThemeId(t.id), blurb: t.blurb })), [])
  const { ref, active } = useActiveItem<HTMLUListElement>()
  const current = all[active] ?? all[0]
  // Each frame's face, cut down to the glyphs the sample page uses.
  useThemeFonts(all.map(({ theme }) => fontHref(theme.font, sampleText)))

  return (
    <section aria-labelledby="themes-title" className="landing-section">
      <div className="landing-wrap grid gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="landing-sticky" data-reveal-group>
          <div data-rule className="landing-rule mb-16" />
          <h2 id="themes-title" data-reveal className="type-title-1">
            Make it yours
          </h2>
          <p data-reveal className="type-body mt-6 max-w-[48ch] text-lg text-ink-soft">
            Your page should look like your work, not like ours. Each theme is a different printed thing: a ticket stub, a zine, a
            blueprint, a Sunday paper.
          </p>
          <div data-reveal className="mt-12 hidden border-t border-rule pt-6 lg:block" aria-live="polite">
            <p className="type-title-2">{current.theme.name}</p>
            <p className="type-body mt-2 max-w-[40ch] text-ink-soft">{current.blurb}</p>
            <p className="type-small mt-6 max-w-[40ch] text-ink-soft">Start from any of the {all.length} and change any layer in your Look panel.</p>
          </div>
        </div>

        <div className="lg:hidden">
          <ThemePicker />
        </div>

        <ul ref={ref} className="hidden grid-cols-2 gap-x-8 gap-y-16 pt-32 lg:grid" aria-label="Themes">
          {all.map(({ theme }, i) => (
            <li key={theme.id} data-index={i} data-reveal-group className={cn(i % 2 === 1 && "translate-y-32")}>
              <div data-reveal>
                <p className={cn("type-small mb-3 font-semibold transition-colors duration-200", i === active ? "text-ink" : "text-ink-soft")}>
                  {theme.name}
                </p>
                <div data-parallax className="landing-frame aspect-[4/5]">
                  <div data-parallax-inner className="landing-frame-inner">
                    <div inert className="landing-frame-zoom h-full">
                      <ThemedPage theme={theme} header={{ name: samplePerson.name, bio: samplePerson.bio }} blocks={pickerBlocks} still nameAs="p" className="min-h-full" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
