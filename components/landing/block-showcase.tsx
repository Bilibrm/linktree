"use client"

import { ThemedPage } from "@/components/page/themed-page"
import { cn } from "@/lib/utils"
import { catalog, catalogTheme } from "./sample-page"
import { useActiveItem } from "./use-active-item"

const slug = (label: string) => `block-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`

/**
 * "What you can put on it" (DESIGN_SYSTEM.md §6.1, §8.1): a sticky split. The title and an
 * index of block types stay on the left while real blocks, drawn by the same `ThemedPage`
 * as a public page, glide past on the right; the index names the one in the middle.
 * The samples are `inert`.
 */
export function BlockShowcase() {
  const { ref, active } = useActiveItem<HTMLOListElement>()

  return (
    <section aria-labelledby="blocks-title" className="landing-section">
      <div className="landing-wrap grid gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="landing-sticky" data-reveal-group>
          <div data-rule className="landing-rule mb-16 lg:mb-16" />
          <h2 id="blocks-title" data-reveal className="type-title-1">
            What you can put on it
          </h2>
          <p data-reveal className="type-body mt-6 max-w-[48ch] text-lg text-ink-soft">
            A page is a stack of blocks. Add the ones you need, drag them into order, hide one for later.
          </p>
          <nav aria-label="Block types" data-reveal className="mt-12 hidden lg:block">
            <ul className="grid gap-1">
              {catalog.map((entry, i) => (
                <li key={entry.label}>
                  <a
                    href={`#${slug(entry.label)}`}
                    aria-current={i === active ? "true" : undefined}
                    className={cn(
                      "landing-index type-title-3 inline-flex min-h-11 items-center gap-3",
                      i === active ? "text-ink" : "text-ink-soft",
                    )}
                  >
                    <span className="landing-index-mark" aria-hidden="true" />
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p data-reveal className="type-small mt-12 max-w-[44ch] text-ink-soft">
            Also in the box: video, embeds from YouTube, Spotify, SoundCloud and TikTok, dividers and spacers.
          </p>
        </div>

        <ol ref={ref} className="grid gap-16 lg:gap-32 lg:pt-32" aria-label="Sample blocks">
          {catalog.map((entry, i) => (
            <li key={entry.label} id={slug(entry.label)} data-index={i} data-reveal-group className="scroll-mt-32">
              <article data-reveal className="landing-card">
                <header className="flex flex-col gap-1 border-b border-rule px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="type-title-3">{entry.label}</h3>
                  <p className="type-small max-w-[38ch] text-ink-soft sm:text-right">{entry.note}</p>
                </header>
                <div inert className="landing-card-sample">
                  <ThemedPage bare theme={catalogTheme} header={{ name: "" }} blocks={entry.blocks} className="px-6 py-8 sm:px-10" />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
