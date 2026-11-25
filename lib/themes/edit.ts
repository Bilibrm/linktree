import { DEFAULT_THEME } from "./catalog"
import { storedToV2, sanitizeV2 } from "./resolve"
import { LAYER_KEYS, type Layer, type ThemeV2 } from "./types"

/**
 * Editing a stored theme from the Look panel (DESIGN_SYSTEM.md §8.5, §8.9). Pure helpers:
 * every change starts from the full v2 recipe behind the stored document, so a page made
 * before v2 keeps its migrated colors, font and corners when the owner changes one layer.
 */

/** What the Look panel saves: the theme id, the recipe and the owner's CSS. */
export type ThemeDraft = { v2: ThemeV2; customCSS: string }

/** The editable draft behind any stored theme. */
export function draftFromStored(stored: unknown): ThemeDraft {
  const { v2 } = storedToV2(stored)
  const css = typeof stored === "object" && stored !== null ? (stored as { customCSS?: unknown }).customCSS : undefined
  return { v2, customCSS: typeof css === "string" ? css : "" }
}

/** Start over from a catalog theme: every layer back to that theme's own. */
export function pickTheme(draft: ThemeDraft, id: string): ThemeDraft {
  return { ...draft, v2: sanitizeV2({ theme: id }) }
}

/** Change part of one layer. Nested layers (palette, background, motion) merge. */
export function patchRecipe(draft: ThemeDraft, patch: Partial<ThemeV2>): ThemeDraft {
  const v2: ThemeV2 = { ...draft.v2 }
  for (const [key, value] of Object.entries(patch) as [keyof ThemeV2, unknown][]) {
    const current = v2[key]
    if (value && typeof value === "object" && current && typeof current === "object") {
      ;(v2 as Record<string, unknown>)[key] = { ...(current as object), ...(value as object) }
    } else {
      ;(v2 as Record<string, unknown>)[key] = value
    }
  }
  return { ...draft, v2: sanitizeV2(v2) }
}

/** Put one layer back to the theme's own values. */
export function resetLayer(draft: ThemeDraft, layer: Layer): ThemeDraft {
  const v2: ThemeV2 = { ...draft.v2 }
  for (const key of LAYER_KEYS[layer]) delete v2[key]
  return { ...draft, v2 }
}

/** The document fields the save writes, as `theme.<key>` paths. Older v1 fields are left alone. */
export function draftToStored(draft: ThemeDraft): { preset: string; v2: ThemeV2; customCSS: string } {
  const v2 = sanitizeV2(draft.v2)
  if (!v2.theme) v2.theme = DEFAULT_THEME
  return { preset: v2.theme, v2, customCSS: draft.customCSS }
}
