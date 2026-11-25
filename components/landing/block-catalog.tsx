"use client"

import { ThemedPage } from "@/components/page/themed-page"
import { cn } from "@/lib/utils"
import { catalog, catalogTheme } from "./sample-page"

/**
 * "What you can put on it": one long proof sheet of real blocks, each named in the margin.
 * The blocks come from `ThemedPage`, the same as on a public page; they are samples, so
 * the sheet is `inert`.
 */
export function BlockCatalog() {
  return (
    <ul className="w-full max-w-[860px]">
      {catalog.map((entry, i) => (
        <li key={entry.label} className="grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-x-6">
          <div className="pt-8 pb-3 md:flex md:items-start md:gap-4 md:pt-9 md:pb-0">
            <div className="md:w-[230px] md:shrink-0">
              <h3 className="type-title-3">{entry.label}</h3>
              <p className="type-small mt-1 max-w-[34ch] text-ink-soft">{entry.note}</p>
            </div>
            {/* The leader from the margin note to its block */}
            <span className="mt-3 hidden h-px flex-1 bg-ink md:block" aria-hidden="true" />
          </div>
          <div
            inert
            className={cn(
              "overflow-hidden border-x border-ink",
              i === 0 ? "rounded-t-panel border-t" : "border-t border-t-rule",
              i === catalog.length - 1 && "rounded-b-panel border-b",
            )}
          >
            <ThemedPage bare theme={catalogTheme} header={{ name: "" }} blocks={entry.blocks} className="px-5 py-6" />
          </div>
        </li>
      ))}
    </ul>
  )
}
