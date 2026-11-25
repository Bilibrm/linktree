/**
 * Theme documents as production has stored them over time, plus shapes that should never
 * exist but must not break a page. `resolveTheme` has to turn every one into a complete
 * theme. Mongoose filled the v1 defaults in on every page it created, so real v1
 * documents carry all of `V1_DEFAULTS`.
 */

const V1_DEFAULTS = {
  backgroundType: "solid",
  backgroundDirection: "135deg",
  backgroundStops: [],
  buttonStyle: "rounded",
  linkStyle: "standard",
  linkHover: "lift",
  socialIconStyle: "outline",
  borderRadius: "soft",
  shadow: "subtle",
  avatarShape: "circle",
  layoutWidth: "normal",
  animation: "fade",
  backgroundBlur: false,
  spacingDensity: "comfortable",
  customCSS: "",
}

const V1_PRESET_CLICKS = {
  minimal: { backgroundColor: "#ffffff", accentColor: "#000000", buttonColor: "#000000", buttonTextColor: "#ffffff" },
  dark: { backgroundColor: "#0a0a0a", accentColor: "#ffffff", buttonColor: "#ffffff", buttonTextColor: "#0a0a0a" },
  vibrant: { backgroundColor: "#f0f0ff", accentColor: "#6366f1", buttonColor: "#6366f1", buttonTextColor: "#ffffff" },
  nature: { backgroundColor: "#f0fdf4", accentColor: "#16a34a", buttonColor: "#16a34a", buttonTextColor: "#ffffff" },
  ocean: { backgroundColor: "#f0f9ff", accentColor: "#0284c7", buttonColor: "#0284c7", buttonTextColor: "#ffffff" },
  sunset: { backgroundColor: "#fef2f2", accentColor: "#e11d48", buttonColor: "#e11d48", buttonTextColor: "#ffffff" },
  mono: { backgroundColor: "#fafafa", accentColor: "#525252", buttonColor: "#525252", buttonTextColor: "#fafafa" },
  bold: { backgroundColor: "#000000", accentColor: "#facc15", buttonColor: "#facc15", buttonTextColor: "#000000" },
} as const

export type ThemeFixture = { name: string; stored: unknown }

/** A page straight from signup that never opened Appearance. */
export const neverCustomised: ThemeFixture = {
  name: "v1 never customised (signup defaults, no colors)",
  stored: { ...V1_DEFAULTS, preset: "minimal" },
}

/** The same owner after clicking the Minimal preset: colors are now stored. */
export const clickedMinimal: ThemeFixture = {
  name: "v1 clicked the Minimal preset",
  stored: { ...V1_DEFAULTS, preset: "minimal", ...V1_PRESET_CLICKS.minimal },
}

export const v1Presets: ThemeFixture[] = Object.entries(V1_PRESET_CLICKS).map(([preset, colors]) => ({
  name: `v1 preset "${preset}"`,
  stored: { ...V1_DEFAULTS, preset, ...colors },
}))

export const v1Fonts: ThemeFixture[] = ["geist-inter", "fraunces-publicsans", "dm-sans", "space-mono", "serif-sans"].map((font) => ({
  name: `v1 font "${font}"`,
  stored: { ...V1_DEFAULTS, preset: "nature", ...V1_PRESET_CLICKS.nature, font },
}))

export const v1Variants: ThemeFixture[] = [
  {
    name: "v1 the signup document before Mongoose defaults",
    stored: { preset: "minimal", backgroundType: "solid", buttonStyle: "rounded", linkStyle: "standard" },
  },
  {
    name: "v1 preset id only, colors lost",
    stored: { preset: "bold" },
  },
  {
    name: "v1 gradient with a raw CSS value",
    stored: {
      ...V1_DEFAULTS,
      preset: "sunset",
      ...V1_PRESET_CLICKS.sunset,
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #a18cd1 100%)",
    },
  },
  {
    name: "v1 gradient with stops",
    stored: {
      ...V1_DEFAULTS,
      preset: "ocean",
      ...V1_PRESET_CLICKS.ocean,
      backgroundType: "gradient",
      backgroundStops: [
        { color: "#0284c7", position: 0 },
        { color: "#7dd3fc", position: 100 },
      ],
    },
  },
  {
    name: "v1 gradient whose value has no colors in it",
    stored: { ...V1_DEFAULTS, preset: "vibrant", ...V1_PRESET_CLICKS.vibrant, backgroundType: "gradient", backgroundValue: "linear-gradient(red, blue)" },
  },
  {
    name: "v1 background image",
    stored: {
      ...V1_DEFAULTS,
      preset: "dark",
      ...V1_PRESET_CLICKS.dark,
      backgroundType: "image",
      backgroundValue: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      backgroundBlur: true,
    },
  },
  {
    name: "v1 background image that is not https",
    stored: { ...V1_DEFAULTS, preset: "dark", ...V1_PRESET_CLICKS.dark, backgroundType: "image", backgroundValue: "javascript:alert(1)" },
  },
  {
    name: "v1 animated background with no value",
    stored: { ...V1_DEFAULTS, preset: "vibrant", ...V1_PRESET_CLICKS.vibrant, backgroundType: "animated" },
  },
  {
    name: "v1 every option away from its default",
    stored: {
      preset: "bold",
      ...V1_PRESET_CLICKS.bold,
      backgroundType: "solid",
      font: "space-mono",
      buttonStyle: "pill",
      linkStyle: "minimal",
      linkHover: "underline",
      socialIconStyle: "filled",
      borderRadius: "pill",
      shadow: "strong",
      avatarShape: "square",
      layoutWidth: "wide",
      animation: "scale",
      spacingDensity: "spacious",
      customCSS: ".my-link { border: 2px solid gold; }",
    },
  },
  {
    name: "v1 card links with a strong shadow, sharp corners",
    stored: { ...V1_DEFAULTS, preset: "mono", ...V1_PRESET_CLICKS.mono, linkStyle: "card", shadow: "strong", buttonStyle: "sharp", linkHover: "fill", animation: "slide" },
  },
  {
    name: "v1 colors typed by hand: short hex, a color name, a CSS injection",
    stored: {
      ...V1_DEFAULTS,
      preset: "minimal",
      backgroundColor: "#FFF",
      accentColor: "rebeccapurple",
      buttonColor: "red; } body { display: none",
      buttonTextColor: "#12345",
    },
  },
  {
    name: "v1 values that are not in any list",
    stored: { ...V1_DEFAULTS, preset: "neon-dreams", buttonStyle: "blob", linkStyle: "glass", animation: "spin", avatarShape: "hexagon", font: "comic-sans", layoutWidth: "huge" },
  },
  {
    name: "v1 object keys that collide with Object.prototype",
    stored: { preset: "constructor", buttonStyle: "__proto__", font: "toString", animation: "valueOf", linkHover: "hasOwnProperty" },
  },
  {
    name: "v1 wrong types everywhere",
    stored: { preset: 42, backgroundColor: ["#fff"], accentColor: { hex: "#000" }, buttonStyle: true, backgroundStops: "nope", animation: null, customCSS: 7, font: 3 },
  },
]

export const malformed: ThemeFixture[] = [
  { name: "undefined", stored: undefined },
  { name: "null", stored: null },
  { name: "empty object", stored: {} },
  { name: "a string", stored: "minimal" },
  { name: "an array", stored: ["minimal"] },
  { name: "a number", stored: 2 },
  { name: "an unknown preset with nothing else", stored: { preset: "does-not-exist" } },
]

export const v2Documents: ThemeFixture[] = [
  { name: "v2 theme only", stored: { preset: "zine", v2: { theme: "zine" } } },
  {
    name: "v2 with every layer changed",
    stored: {
      preset: "riso",
      customCSS: ".lp-tile { letter-spacing: 0.02em; }",
      v2: {
        theme: "riso",
        palette: { background: "#101010", surface: "#202020", text: "#fafafa", accent: "#ffd23f", accentText: "#101010" },
        font: "newsreader",
        layout: "poster",
        width: "wide",
        density: "spacious",
        avatar: "square",
        blockStyle: "ticket",
        shape: "pill",
        background: { kind: "image", ink: "#00838a", image: "https://images.unsplash.com/photo-1?w=1200" },
        motion: { entrance: "slide", hover: "flicker" },
      },
    },
  },
  { name: "v2 with an unknown theme id", stored: { preset: "minimal", v2: { theme: "vaporwave", layout: "grid" } } },
  { name: "v2 with an unknown theme id and a v2 preset", stored: { preset: "tape", v2: { theme: "vaporwave" } } },
  {
    name: "v2 with values outside every list",
    stored: {
      preset: "poster",
      v2: {
        theme: "poster",
        layout: "masonry",
        blockStyle: "glass",
        shape: "blob",
        font: "comic-sans",
        avatar: "hexagon",
        width: 900,
        density: null,
        palette: { background: "url(https://evil.example/x)", text: "#12", accent: "red;}body{display:none" },
        background: { kind: "video", ink: "expression(alert(1))", image: 'https://x.example/a.png"); background: url(javascript:alert(1)' },
        motion: { entrance: "spin", hover: ["lift"] },
      },
    },
  },
  { name: "v2 where layers have the wrong type", stored: { preset: "arcade", v2: { theme: "arcade", palette: "pink", background: 4, motion: [] } } },
  { name: "v2 image background with no image", stored: { preset: "darkroom", v2: { theme: "darkroom", background: { kind: "image" } } } },
  { name: "v2 theme id in preset, recipe missing", stored: { preset: "blueprint" } },
  { name: "v2 theme id in preset, recipe empty", stored: { preset: "botanical", v2: {} } },
  {
    name: "v2 saved over a v1 document (v1 fields still present)",
    stored: { ...V1_DEFAULTS, preset: "ocean-print", ...V1_PRESET_CLICKS.dark, font: "dm-sans", v2: { theme: "ocean-print" } },
  },
]

export const allFixtures: ThemeFixture[] = [neverCustomised, clickedMinimal, ...v1Presets, ...v1Fonts, ...v1Variants, ...malformed, ...v2Documents]
