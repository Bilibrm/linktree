import type { FontPair } from "./types"

const G = "https://fonts.googleapis.com/css2?"
const SANS = "ui-sans-serif, system-ui, sans-serif"
const SERIF = "ui-serif, Georgia, serif"
const MONO = "ui-monospace, 'Courier New', monospace"

/**
 * Curated font pairs (DESIGN_SYSTEM.md §8.9). Archivo is the LinkNest default and ships
 * with the app through next/font, so a default page asks no third party for anything.
 * Every other pair loads one Google Fonts stylesheet, and only on pages that use it.
 */
export const fontPairs: FontPair[] = [
  {
    id: "archivo",
    label: "Archivo, wide and regular",
    display: `var(--font-archivo), 'Archivo', ${SANS}`,
    body: `var(--font-archivo), 'Archivo', ${SANS}`,
    href: null,
    displayWeight: 850,
    bodyWeight: 400,
    labelWeight: 650,
    displayStretch: "122%",
    displayTracking: "-0.03em",
    fit: 0.68,
  },
  {
    id: "anton",
    label: "Anton and Barlow",
    display: `'Anton', 'Impact', ${SANS}`,
    body: `'Barlow', ${SANS}`,
    href: `${G}family=Anton&family=Barlow:wght@400;500;600;700&display=swap`,
    displayWeight: 400,
    bodyWeight: 500,
    labelWeight: 600,
    displayCase: "uppercase",
    displayTracking: "0.005em",
    fit: 0.47,
  },
  {
    id: "bricolage",
    label: "Bricolage Grotesque",
    display: `'Bricolage Grotesque', ${SANS}`,
    body: `'Bricolage Grotesque', ${SANS}`,
    href: `${G}family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap`,
    displayWeight: 800,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.035em",
    fit: 0.56,
  },
  {
    id: "redhat",
    label: "Red Hat Display and Text",
    display: `'Red Hat Display', ${SANS}`,
    body: `'Red Hat Text', ${SANS}`,
    href: `${G}family=Red+Hat+Display:wght@500..900&family=Red+Hat+Text:wght@400..700&display=swap`,
    displayWeight: 800,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.025em",
    fit: 0.58,
  },
  {
    id: "drafting",
    label: "Chakra Petch and IBM Plex Sans",
    display: `'Chakra Petch', ${SANS}`,
    body: `'IBM Plex Sans', ${SANS}`,
    href: `${G}family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap`,
    displayWeight: 600,
    bodyWeight: 400,
    labelWeight: 500,
    displayCase: "uppercase",
    displayTracking: "0.04em",
    fit: 0.66,
  },
  {
    id: "neon",
    label: "Tilt Neon and Sora",
    display: `'Tilt Neon', ${SANS}`,
    body: `'Sora', ${SANS}`,
    href: `${G}family=Tilt+Neon&family=Sora:wght@400..700&display=swap`,
    displayWeight: 400,
    bodyWeight: 400,
    labelWeight: 500,
    displayTracking: "0.01em",
    fit: 0.58,
  },
  {
    id: "youngserif",
    label: "Young Serif and Hanken Grotesk",
    display: `'Young Serif', ${SERIF}`,
    body: `'Hanken Grotesk', ${SANS}`,
    href: `${G}family=Young+Serif&family=Hanken+Grotesk:wght@400..700&display=swap`,
    displayWeight: 400,
    bodyWeight: 400,
    labelWeight: 550,
    displayTracking: "-0.02em",
    fit: 0.57,
  },
  {
    id: "slab",
    label: "Alfa Slab One and Barlow Semi Condensed",
    display: `'Alfa Slab One', 'Rockwell', ${SERIF}`,
    body: `'Barlow Semi Condensed', ${SANS}`,
    href: `${G}family=Alfa+Slab+One&family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap`,
    displayWeight: 400,
    bodyWeight: 500,
    labelWeight: 600,
    displayTracking: "0.005em",
    fit: 0.66,
  },
  {
    id: "typewriter",
    label: "Special Elite and Courier Prime",
    display: `'Special Elite', ${MONO}`,
    body: `'Courier Prime', ${MONO}`,
    href: `${G}family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap`,
    displayWeight: 400,
    bodyWeight: 400,
    labelWeight: 700,
    displayTracking: "-0.01em",
    fit: 0.6,
  },
  {
    id: "newsreader",
    label: "Newsreader",
    display: `'Newsreader', ${SERIF}`,
    body: `'Newsreader', ${SERIF}`,
    href: `${G}family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..800&display=swap`,
    displayWeight: 750,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.025em",
    fit: 0.52,
  },
  {
    id: "pixel",
    label: "Pixelify Sans and Rubik",
    display: `'Pixelify Sans', ${SANS}`,
    body: `'Rubik', ${SANS}`,
    href: `${G}family=Pixelify+Sans:wght@400..700&family=Rubik:wght@400..700&display=swap`,
    displayWeight: 700,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "0em",
    fit: 0.6,
  },
  {
    id: "marker",
    label: "Caveat Brush and Karla",
    display: `'Caveat Brush', 'Bradley Hand', cursive`,
    body: `'Karla', ${SANS}`,
    href: `${G}family=Caveat+Brush&family=Karla:wght@400..700&display=swap`,
    displayWeight: 400,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "0em",
    fit: 0.46,
  },
  {
    id: "unbounded",
    label: "Unbounded and Figtree",
    display: `'Unbounded', ${SANS}`,
    body: `'Figtree', ${SANS}`,
    href: `${G}family=Unbounded:wght@400..800&family=Figtree:wght@400..700&display=swap`,
    displayWeight: 700,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.03em",
    fit: 0.74,
  },
  {
    id: "hanken",
    label: "Hanken Grotesk",
    display: `'Hanken Grotesk', ${SANS}`,
    body: `'Hanken Grotesk', ${SANS}`,
    href: `${G}family=Hanken+Grotesk:wght@400..800&display=swap`,
    displayWeight: 800,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.035em",
    fit: 0.56,
  },
  {
    id: "instrument",
    label: "Instrument Serif and Sans",
    display: `'Instrument Serif', ${SERIF}`,
    body: `'Instrument Sans', ${SANS}`,
    href: `${G}family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400..700&display=swap`,
    displayWeight: 400,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.015em",
    fit: 0.46,
  },
  {
    id: "fraunces",
    label: "Fraunces and Public Sans",
    display: `'Fraunces', ${SERIF}`,
    body: `'Public Sans', ${SANS}`,
    href: `${G}family=Fraunces:opsz,wght@9..144,400..800&family=Public+Sans:wght@400..700&display=swap`,
    displayWeight: 700,
    bodyWeight: 400,
    labelWeight: 600,
    displayTracking: "-0.02em",
    fit: 0.56,
  },
]

export const DEFAULT_FONT = "archivo"

export function fontPair(id: unknown): FontPair | undefined {
  return typeof id === "string" ? fontPairs.find((f) => f.id === id) : undefined
}

/** Font ids stored by pages made before v2, and the pair that stands in for each. */
export const LEGACY_FONTS: Record<string, string> = {
  "geist-inter": "hanken",
  "fraunces-publicsans": "fraunces",
  "dm-sans": "hanken",
  "space-mono": "drafting",
  "serif-sans": "instrument",
}

/**
 * A pair's stylesheet, optionally cut down to the glyphs of `text` (Google Fonts `text=`).
 * Thumbnails use the cut-down files: a few kilobytes per family instead of the whole face.
 */
export function fontHref(pair: FontPair, text?: string): string | null {
  if (!pair.href) return null
  if (!text) return pair.href
  // Some pairs set the name in capitals, so both cases ship.
  const glyphs = [...new Set((text + text.toUpperCase()).replace(/\s+/g, ""))].sort().join("")
  return `${pair.href}&text=${encodeURIComponent(glyphs + " ")}`
}
