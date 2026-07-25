import {
  puffIn,
  vanishIn as vanishInRaw,
  twisterInUp,
  swashIn,
  perspectiveUpReturn,
} from "react-magic"

export type MagicAnimationName =
  | "puffIn"
  | "vanishIn"
  | "twisterInUp"
  | "swashIn"
  | "perspectiveUpReturn"

/** Cap extreme blur from react-magic vanishIn (90px → 8px). */
function softenVanish(frames: Record<string, Record<string, string>>) {
  const out: Record<string, Record<string, string>> = {}
  for (const [pct, styles] of Object.entries(frames)) {
    out[pct] = { ...styles }
    if (out[pct].filter?.includes("blur")) {
      out[pct].filter = out[pct].filter.replace(/blur\(\d+px\)/, "blur(8px)")
    }
    if (out[pct].transform?.includes("scale(2")) {
      out[pct].transform = out[pct].transform.replace(/scale\(2(?:,\s*2)?\)/, "scale(1.06)")
    }
  }
  return out
}

const vanishIn = softenVanish(vanishInRaw)

const ANIMATION_MAP: Record<MagicAnimationName, Record<string, Record<string, string>>> = {
  puffIn,
  vanishIn,
  twisterInUp,
  swashIn,
  perspectiveUpReturn,
}

function camelToKebab(str: string) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase()
}

export function magicFramesToCss(name: string, frames: Record<string, Record<string, string>>) {
  const steps = Object.entries(frames)
    .map(([pct, styles]) => {
      const rules = Object.entries(styles)
        .map(([prop, val]) => `${camelToKebab(prop)}: ${val}`)
        .join("; ")
      return `${pct} { ${rules} }`
    })
    .join("\n")
  return `@keyframes ${name} { ${steps} }`
}

export function getMagicKeyframes(name: MagicAnimationName) {
  return ANIMATION_MAP[name]
}
