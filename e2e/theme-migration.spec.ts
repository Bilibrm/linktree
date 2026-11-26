import { test, expect } from "@playwright/test"
import {
  AVATARS,
  BACKGROUNDS,
  BLOCK_STYLES,
  DENSITIES,
  ENTRANCES,
  HOVERS,
  LAYOUTS,
  SHAPES,
  WIDTHS,
  contrast,
  fontPair,
  fontPairs,
  pickableThemes,
  resolveTheme,
  resolveThemeId,
  themeRootProps,
  themes,
  draftFromStored,
  draftToStored,
  patchRecipe,
  pickTheme,
  resetLayer,
  type ResolvedTheme,
} from "../lib/themes"
import { themeSaveSchema } from "../lib/validation"
import { allFixtures, clickedMinimal, neverCustomised, v1Fonts, v1Presets, v1Variants, v2Documents } from "./fixtures/old-themes"

/**
 * `resolveTheme` is what stands between a stored theme of any age and a rendered page
 * (DESIGN_SYSTEM.md §8.9). These checks run in Node: no browser, no database.
 */

const HEX = /^#[0-9a-f]{6}$/

/** Every field present, from the allowed lists, and nothing that could break out of a CSS value. */
function expectComplete(theme: ResolvedTheme) {
  for (const color of [...Object.values(theme.palette), theme.onSurface, theme.background.ink]) expect(color).toMatch(HEX)
  expect(Object.keys(theme.palette).sort()).toEqual(["accent", "accentText", "background", "surface", "text"])
  expect(themes.map((t) => t.id)).toContain(theme.id)
  expect(fontPairs).toContain(theme.font)
  expect(LAYOUTS).toContain(theme.layout)
  expect(WIDTHS).toContain(theme.width)
  expect(DENSITIES).toContain(theme.density)
  expect(AVATARS).toContain(theme.avatar)
  expect(BLOCK_STYLES).toContain(theme.blockStyle)
  expect(SHAPES).toContain(theme.shape)
  expect(BACKGROUNDS).toContain(theme.background.kind)
  expect(ENTRANCES).toContain(theme.motion.entrance)
  expect(HOVERS).toContain(theme.motion.hover)
  expect(typeof theme.customCSS).toBe("string")
  if (theme.background.kind === "image") expect(theme.background.image).toMatch(/^https:\/\//)

  const { style, attrs } = themeRootProps(theme)
  for (const [key, value] of Object.entries(style)) {
    expect(typeof value, key).toBe("string")
    expect(value.length, key).toBeGreaterThan(0)
    // Font stacks and the image URL are ours or validated; nothing may close the declaration.
    expect(value, key).not.toMatch(/[;{}<>]|javascript:|expression\(/i)
  }
  for (const value of Object.values(attrs)) expect(value).toMatch(/^[a-z0-9-]+$/)
}

test.describe("resolveTheme: old documents", () => {
  for (const fixture of allFixtures) {
    test(`resolves: ${fixture.name}`, () => {
      const theme = resolveTheme(fixture.stored)
      expectComplete(theme)
      // The same input always gives the same theme, and resolving does not touch the input.
      const snapshot = JSON.stringify(fixture.stored)
      expect(resolveTheme(fixture.stored)).toEqual(theme)
      expect(JSON.stringify(fixture.stored)).toBe(snapshot)
    })
  }

  test("a page that never opened Appearance keeps the look it had", () => {
    const theme = resolveTheme(neverCustomised.stored)
    expect(theme.legacy).toBe(true)
    expect(theme.id).toBe("legacy")
    expect(theme.palette).toMatchObject({ background: "#ffffff", text: "#16302a", accent: "#16302a", accentText: "#f5f1e4" })
    expect(theme.layout).toBe("grid")
    expect(theme.blockStyle).toBe("soft")
    expect(theme.shape).toBe("round")
    expect(theme.motion).toEqual({ entrance: "fade", hover: "lift" })
  })

  test("clicking the Minimal preset is not the same as never choosing", () => {
    const theme = resolveTheme(clickedMinimal.stored)
    expect(theme.palette).toMatchObject({ background: "#ffffff", text: "#000000", accent: "#000000", accentText: "#ffffff" })
  })

  test("each v1 preset keeps its four colors", () => {
    for (const fixture of v1Presets) {
      const stored = fixture.stored as Record<string, string>
      const theme = resolveTheme(stored)
      expect(theme.legacy, fixture.name).toBe(true)
      expect(theme.palette.background, fixture.name).toBe(stored.backgroundColor)
      expect(theme.palette.text, fixture.name).toBe(stored.accentColor)
      expect(theme.palette.accent, fixture.name).toBe(stored.buttonColor)
      expect(theme.palette.accentText, fixture.name).toBe(stored.buttonTextColor)
      // v1 tiles were tinted from the page ink; the migrated surface must stay readable.
      expect(contrast(theme.onSurface, theme.palette.surface), fixture.name).toBeGreaterThanOrEqual(4.5)
    }
  })

  test("a preset id with no colors falls back to that preset's colors", () => {
    const theme = resolveTheme({ preset: "bold" })
    expect(theme.palette).toMatchObject({ background: "#000000", text: "#facc15", accent: "#facc15", accentText: "#000000" })
  })

  test("each v1 font maps to a pair", () => {
    const expected: Record<string, string> = {
      "geist-inter": "hanken",
      "fraunces-publicsans": "fraunces",
      "dm-sans": "hanken",
      "space-mono": "drafting",
      "serif-sans": "instrument",
    }
    for (const fixture of v1Fonts) {
      const font = (fixture.stored as { font: string }).font
      expect(resolveTheme(fixture.stored).font.id, font).toBe(expected[font])
    }
  })

  test("v1 backgrounds map to the closest v2 kind", () => {
    const byName = (name: string) => resolveTheme(v1Variants.find((f) => f.name === name)!.stored)

    const raw = byName("v1 gradient with a raw CSS value")
    expect(raw.background).toMatchObject({ kind: "duotone", ink: "#a18cd1" })
    expect(raw.palette.background).toBe("#fef2f2")

    expect(byName("v1 gradient with stops").background).toMatchObject({ kind: "duotone", ink: "#7dd3fc" })
    expect(byName("v1 gradient whose value has no colors in it").background).toMatchObject({ kind: "duotone", ink: "#6366f1" })
    expect(byName("v1 background image").background).toMatchObject({ kind: "image", image: "https://res.cloudinary.com/demo/image/upload/sample.jpg" })
    expect(byName("v1 background image that is not https").background).toMatchObject({ kind: "flat", image: null })
    expect(byName("v1 animated background with no value").background).toMatchObject({ kind: "drift", ink: "#6366f1" })
  })

  test("v1 options map field by field", () => {
    const theme = resolveTheme(v1Variants.find((f) => f.name === "v1 every option away from its default")!.stored)
    expect(theme).toMatchObject({
      legacy: true,
      layout: "grid",
      width: "wide",
      density: "spacious",
      avatar: "square",
      blockStyle: "underline",
      shape: "pill",
      motion: { entrance: "print", hover: "underline" },
      customCSS: ".my-link { border: 2px solid gold; }",
    })
    expect(theme.font.id).toBe("drafting")

    const card = resolveTheme(v1Variants.find((f) => f.name.startsWith("v1 card links"))!.stored)
    expect(card).toMatchObject({ blockStyle: "offset", shape: "sharp", motion: { entrance: "slide", hover: "fill" } })
  })

  test("hand-typed colors: valid hex is kept, everything else is dropped", () => {
    const theme = resolveTheme(v1Variants.find((f) => f.name.startsWith("v1 colors typed by hand"))!.stored)
    expect(theme.palette.background).toBe("#ffffff")
    expect(theme.palette.text).toBe("#16302a")
    expect(theme.palette.accent).toBe("#16302a")
    expect(theme.palette.accentText).toBe("#f5f1e4")
  })

  test("nothing usable gives the default theme", () => {
    for (const stored of [undefined, null, {}, "minimal", 2, { preset: "does-not-exist" }]) {
      const theme = resolveTheme(stored)
      expect(theme.id).toBe("riso")
      expect(theme.legacy).toBe(false)
    }
  })
})

test.describe("resolveTheme: v2 documents", () => {
  const byName = (name: string) => resolveTheme(v2Documents.find((f) => f.name === name)!.stored)

  test("a theme with nothing changed is the catalog theme", () => {
    const theme = byName("v2 theme only")
    expect(theme).toEqual(resolveThemeId("zine"))
    expect(Object.values(theme.changed)).toEqual([false, false, false, false, false, false])
  })

  test("changed layers win over the theme, and are reported as changed", () => {
    const theme = byName("v2 with every layer changed")
    expect(theme).toMatchObject({
      id: "riso",
      layout: "poster",
      width: "wide",
      density: "spacious",
      avatar: "square",
      blockStyle: "ticket",
      shape: "pill",
      motion: { entrance: "slide", hover: "flicker" },
      background: { kind: "image", ink: "#00838a", image: "https://images.unsplash.com/photo-1?w=1200" },
      palette: { background: "#101010", surface: "#202020", text: "#fafafa", accent: "#ffd23f", accentText: "#101010" },
      changed: { palette: true, font: true, layout: true, blocks: true, background: true, motion: true },
    })
    expect(theme.font.id).toBe("newsreader")
  })

  test("an unknown theme id falls back, keeping valid layers", () => {
    expect(byName("v2 with an unknown theme id")).toMatchObject({ id: "riso", layout: "grid" })
    expect(byName("v2 with an unknown theme id and a v2 preset").id).toBe("tape")
  })

  test("values outside the lists fall back to the theme's own", () => {
    expect(byName("v2 with values outside every list")).toEqual(resolveThemeId("poster"))
    expect(byName("v2 where layers have the wrong type")).toEqual(resolveThemeId("arcade"))
  })

  test("an image background with no image falls back to the theme's background", () => {
    expect(byName("v2 image background with no image").background).toMatchObject({ kind: "grain", image: null })
  })

  test("a v2 recipe wins over v1 fields left in the same document", () => {
    const theme = byName("v2 saved over a v1 document (v1 fields still present)")
    expect(theme).toEqual(resolveThemeId("ocean-print"))
  })

  test("a v2 theme id in preset is enough", () => {
    expect(byName("v2 theme id in preset, recipe missing")).toEqual(resolveThemeId("blueprint"))
    expect(byName("v2 theme id in preset, recipe empty")).toEqual(resolveThemeId("botanical"))
  })
})

test.describe("theme catalog", () => {
  test("ships 12 to 16 themes with unique ids and real fonts", () => {
    expect(pickableThemes.length).toBeGreaterThanOrEqual(12)
    expect(pickableThemes.length).toBeLessThanOrEqual(16)
    expect(new Set(themes.map((t) => t.id)).size).toBe(themes.length)
    expect(new Set(fontPairs.map((f) => f.id)).size).toBe(fontPairs.length)
    for (const theme of themes) expect(fontPair(theme.font), theme.id).toBeTruthy()
  })

  test("the default theme asks no third party for fonts", () => {
    expect(resolveThemeId("riso").font.href).toBeNull()
  })

  for (const def of themes) {
    test(`${def.name} reads at AA`, () => {
      const theme = resolveThemeId(def.id)
      expectComplete(theme)
      const { palette } = theme
      expect(contrast(palette.text, palette.background), "text on background").toBeGreaterThanOrEqual(4.5)
      expect(contrast(theme.onSurface, palette.surface), "text on blocks").toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette.accentText, palette.accent), "text on accent").toBeGreaterThanOrEqual(4.5)
      const { style } = themeRootProps(theme)
      expect(contrast(style["--lp-muted"], palette.background), "secondary text").toBeGreaterThanOrEqual(4.5)
      expect(contrast(style["--lp-on-surface-muted"], palette.surface), "secondary text on blocks").toBeGreaterThanOrEqual(4.5)
    })
  }

  test("no two themes share layout, block style and background", () => {
    const seen = new Set<string>()
    for (const t of pickableThemes) {
      const key = `${t.layout}/${t.blockStyle}/${t.background.kind}/${t.shape}`
      expect(seen.has(key), `${t.id}: ${key}`).toBe(false)
      seen.add(key)
    }
  })
})

/** Hue in degrees and saturation (HSL) of a six-digit hex color. */
function hueSat(hex: string): [number, number] {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return [0, 0]
  const l = (max + min) / 2
  const sat = d / (1 - Math.abs(2 * l - 1))
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  return [h < 0 ? h + 360 : h, sat]
}

test.describe("theme catalog: inks", () => {
  test("no theme prints in violet or lavender", () => {
    for (const def of themes) {
      for (const color of [...Object.values(def.palette), def.background.ink]) {
        const [hue, sat] = hueSat(color)
        const violet = sat > 0.2 && hue >= 245 && hue <= 320
        expect(violet, `${def.id} ${color} (hue ${Math.round(hue)})`).toBe(false)
      }
    }
  })
})

test.describe("saving from the Look panel", () => {
  const v1 = [neverCustomised, clickedMinimal, ...v1Presets, ...v1Fonts, ...v1Variants]

  test("a page made before v2 keeps its look when one layer changes", () => {
    for (const fixture of v1) {
      const before = resolveTheme(fixture.stored)
      const draft = patchRecipe(draftFromStored(fixture.stored), { layout: "stack" })
      const saved = draftToStored(draft)
      // What the server action accepts, and what Mongo then holds next to the old fields.
      expect(themeSaveSchema.safeParse({ v2: saved.v2, customCSS: saved.customCSS }).success, fixture.name).toBe(true)
      const stored = { ...(fixture.stored as object), ...saved }
      const after = resolveTheme(stored)
      expect(after.layout, fixture.name).toBe("stack")
      expect(after.palette, fixture.name).toEqual(before.palette)
      expect(after.font.id, fixture.name).toBe(before.font.id)
      expect(after.shape, fixture.name).toBe(before.shape)
      expect(after.blockStyle, fixture.name).toBe(before.blockStyle)
      expect(after.background, fixture.name).toEqual(before.background)
      expect(after.motion, fixture.name).toEqual(before.motion)
      expect(after.customCSS, fixture.name).toBe(before.customCSS)
    }
  })

  test("picking a theme starts clean, and a reset puts back one layer", () => {
    const start = draftFromStored(v2Documents.find((f) => f.name === "v2 with every layer changed")!.stored)
    const picked = pickTheme(start, "tape")
    expect(resolveTheme(draftToStored(picked))).toMatchObject({ ...resolveThemeId("tape"), customCSS: start.customCSS })

    const reset = resetLayer(start, "palette")
    const theme = resolveTheme(draftToStored(reset))
    expect(theme.palette).toEqual(resolveThemeId("riso").palette)
    expect(theme.layout).toBe("poster")
    expect(theme.changed.palette).toBe(false)
  })

  test("a nested layer merges instead of replacing", () => {
    const draft = patchRecipe(patchRecipe(draftFromStored({ preset: "riso" }), { palette: { accent: "#ffd23f" } }), { palette: { text: "#000000" } })
    expect(draft.v2.palette).toEqual({ accent: "#ffd23f", text: "#000000" })
  })

  test("the save schema rejects values that could reach CSS", () => {
    for (const bad of [
      { v2: { palette: { accent: "red;}body{display:none" } }, customCSS: "" },
      { v2: { background: { image: 'https://x.example/a.png"); background: url(javascript:alert(1)' } }, customCSS: "" },
      { v2: { layout: "masonry" }, customCSS: "" },
    ]) {
      expect(themeSaveSchema.safeParse(bad).success).toBe(false)
    }
  })
})
