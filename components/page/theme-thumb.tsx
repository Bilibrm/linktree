import type { IBlock } from "@/types"
import type { ResolvedTheme } from "@/lib/themes"
import { ThemedPage, type PageHeader } from "./themed-page"

/** The phone width a thumbnail is drawn at before it is scaled down. */
const SHEET = 360

/**
 * A tiny live proof of a theme (DESIGN_SYSTEM.md §8.5: presets render as tiny proofs, not
 * swatches). The page is laid out at phone width, because every theme sizes itself from
 * its own width, then scaled to `width`. Still and inert.
 */
export function ThemeThumb({ theme, header, blocks, width }: { theme: ResolvedTheme; header: PageHeader; blocks: IBlock[]; width: number }) {
  const scale = width / SHEET
  return (
    <span className="ln-thumb" style={{ width, height: Math.round(width * 1.25) }} aria-hidden="true">
      <span inert className="ln-thumb-sheet" style={{ width: SHEET, transform: `scale(${scale})` }}>
        <ThemedPage theme={theme} header={header} blocks={blocks} still nameAs="p" className="ln-thumb-page" />
      </span>
    </span>
  )
}
