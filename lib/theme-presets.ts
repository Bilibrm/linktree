import type { ThemeConfig, ThemePreset } from "@/types"

export type ThemePresetOption = {
  name: ThemePreset
  label: string
  colors: { bg: string; accent: string; btn: string; text: string }
}

/** Owner-facing theme presets. Shared by the Look editor and the landing theme picker. */
export const themePresets: ThemePresetOption[] = [
  { name: "minimal", label: "Minimal", colors: { bg: "#ffffff", accent: "#000000", btn: "#000000", text: "#ffffff" } },
  { name: "dark", label: "Dark", colors: { bg: "#0a0a0a", accent: "#ffffff", btn: "#ffffff", text: "#0a0a0a" } },
  { name: "vibrant", label: "Vibrant", colors: { bg: "#f0f0ff", accent: "#6366f1", btn: "#6366f1", text: "#ffffff" } },
  { name: "nature", label: "Nature", colors: { bg: "#f0fdf4", accent: "#16a34a", btn: "#16a34a", text: "#ffffff" } },
  { name: "ocean", label: "Ocean", colors: { bg: "#f0f9ff", accent: "#0284c7", btn: "#0284c7", text: "#ffffff" } },
  { name: "sunset", label: "Sunset", colors: { bg: "#fef2f2", accent: "#e11d48", btn: "#e11d48", text: "#ffffff" } },
  { name: "mono", label: "Monochrome", colors: { bg: "#fafafa", accent: "#525252", btn: "#525252", text: "#fafafa" } },
  { name: "bold", label: "Bold", colors: { bg: "#000000", accent: "#facc15", btn: "#facc15", text: "#000000" } },
]

/** The colors a preset sets on a theme. Everything else on the theme is left alone. */
export function presetColors(preset: ThemePresetOption): Pick<ThemeConfig, "preset" | "backgroundColor" | "buttonColor" | "buttonTextColor" | "accentColor"> {
  return {
    preset: preset.name,
    backgroundColor: preset.colors.bg,
    buttonColor: preset.colors.btn,
    buttonTextColor: preset.colors.text,
    accentColor: preset.colors.accent,
  }
}
