"use client"

import { BlockRenderer } from "@/components/blocks/block-renderer"
import { getBlockSpanClass, themeToCSSVars } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import { catalog, pressTheme } from "./sample-page"

/**
 * "What you can put on it": one long proof sheet of real blocks, each named in the margin.
 * The blocks come from `BlockRenderer`, the same as on a public page; they are samples, so
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
              "border-x border-ink bg-sheet px-5 py-6",
              i === 0 ? "rounded-t-panel border-t" : "border-t border-t-rule",
              i === catalog.length - 1 && "rounded-b-panel border-b",
            )}
            style={{ ...themeToCSSVars(pressTheme), fontFamily: "var(--page-font-family)" }}
          >
            <div className="grid grid-cols-2 gap-3">
              {entry.blocks.map((block, j) => (
                <div key={block._id} className={getBlockSpanClass(block.type, block.data)}>
                  <BlockRenderer block={block} theme={pressTheme} index={j} />
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
