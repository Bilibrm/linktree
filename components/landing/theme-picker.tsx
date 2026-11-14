"use client"

import { useState } from "react"
import { themePresets, presetColors } from "@/lib/theme-presets"
import { cn } from "@/lib/utils"
import { Proof } from "./proof"
import { pickerBaseTheme, pickerBlocks, samplePerson } from "./sample-page"

/**
 * "Make it yours": the real presets from the Look editor, applied live to a proof.
 * Native radios, so arrow keys move between presets.
 */
export function ThemePicker() {
  const [selected, setSelected] = useState(themePresets[5].name)
  const preset = themePresets.find((p) => p.name === selected) ?? themePresets[0]
  const theme = { ...pickerBaseTheme, ...presetColors(preset) }

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_380px] md:items-start md:gap-16">
      <fieldset className="min-w-0">
        <legend className="type-small font-semibold text-ink">Pick a preset</legend>
        <div className="mt-3 grid grid-cols-2 border-t border-l border-ink sm:max-w-[440px]">
          {themePresets.map((p) => {
            const active = p.name === selected
            return (
              <label
                key={p.name}
                className={cn(
                  "relative flex min-h-14 cursor-pointer items-center gap-3 border-r border-b border-ink px-3 transition-colors duration-150 has-focus-visible:z-10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-pink",
                  active ? "bg-ink text-paper" : "bg-sheet text-ink hover:bg-tint",
                )}
              >
                <input
                  type="radio"
                  name="landing-preset"
                  value={p.name}
                  checked={active}
                  onChange={() => setSelected(p.name)}
                  className="press-bare-input sr-only"
                />
                {/* The preset in miniature: its page color with its button color on it */}
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-label border border-ink"
                  style={{ backgroundColor: p.colors.bg }}
                  aria-hidden="true"
                >
                  <span className="h-1.5 w-4" style={{ backgroundColor: p.colors.btn }} />
                </span>
                <span className="type-small font-semibold">{p.label}</span>
              </label>
            )
          })}
        </div>
        <p className="type-small mt-4 max-w-[44ch] text-ink-soft">
          A preset is a starting point. In the editor you can change every color, the font pair, the corners and the
          background, or write your own CSS.
        </p>
      </fieldset>

      <div className="flex justify-center md:justify-end">
        <Proof blocks={pickerBlocks} theme={theme} username={samplePerson.username} name={samplePerson.name} bio={samplePerson.bio} />
      </div>
    </div>
  )
}
