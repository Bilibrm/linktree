/** Small color helpers for theme validation and contrast checks. Hex in, hex out. */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** A six-digit lowercase hex color, or null when the input is anything else. */
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  if (!HEX.test(v)) return null
  if (v.length === 4) return ("#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toLowerCase()
  return v.toLowerCase()
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two six-digit hex colors. */
export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** `amount` of `a` over `b`, like `color-mix(in srgb, a amount, b)`. */
export function mix(a: string, b: string, amount: number): string {
  const ca = channels(a)
  const cb = channels(b)
  const out = ca.map((c, i) => Math.round(c * amount + cb[i] * (1 - amount)))
  return "#" + out.map((c) => c.toString(16).padStart(2, "0")).join("")
}

/** The first candidate that reads at AA on `on`; otherwise whichever of black or white reads best. */
export function readableOn(on: string, candidates: string[]): string {
  for (const c of candidates) if (contrast(c, on) >= 4.5) return c
  return contrast("#000000", on) >= contrast("#ffffff", on) ? "#000000" : "#ffffff"
}

/** Whether light text reads better than dark text on this color. */
export function isDark(hex: string): boolean {
  return contrast("#ffffff", hex) > contrast("#000000", hex)
}
