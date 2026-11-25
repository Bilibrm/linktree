import type { BlockType, IBlock } from "@/types"
import { resolveTheme } from "@/lib/themes"
import type { FlatBlockData } from "@/lib/validation"

/**
 * Sample content for the landing page. These are ordinary blocks and themes, rendered by
 * the same `BlockRenderer` as a public page. `pageId` is empty so click and form tracking
 * never fire, and every link carries an icon so nothing is fetched from a third party.
 */

export const samplePerson = {
  username: "amina",
  name: "Amina Haddad",
  bio: "Riso prints and zines, made in Algiers.",
}

function block(id: string, type: BlockType, data: FlatBlockData): IBlock {
  return { _id: `sample-${id}`, pageId: "", type, order: 0, data, isActive: true }
}

const shop = block("shop", "link", {
  title: "Spring print run is open",
  url: "https://example.com/shop",
  icon: "website",
  featured: true,
})
const zine = block("zine", "link", { title: "Read zine no. 4", url: "https://example.com/zine", icon: "medium" })
const letter = block("letter", "link", { title: "Studio letter", url: "https://example.com/letter", icon: "email" })
const print = block("print", "image", { src: "/landing/print-1.svg", alt: "Two-color print: a pink sun behind a blue arch" })
const social = block("social", "social", {
  links: [
    { platform: "instagram", url: "https://example.com/instagram" },
    { platform: "tiktok", url: "https://example.com/tiktok" },
    { platform: "youtube", url: "https://example.com/youtube" },
    { platform: "email", url: "https://example.com/contact" },
  ],
})

/** The page the hero composes, in the order the blocks land. */
export const heroBlocks: IBlock[] = [shop, zine, letter, print, social]

/** A shorter page for the theme picker, so the whole restyle is visible at once. */
export const pickerBlocks: IBlock[] = [
  shop,
  zine,
  letter,
  social,
  block("book", "button", { label: "Book a workshop", url: "https://example.com/workshops", variant: "outline", fullWidth: true }),
]

/** Three short links: enough to show a theme's tiles in a thumbnail. */
export const thumbBlocks: IBlock[] = [
  block("t-shop", "link", { title: "Print shop", url: "https://example.com/shop", icon: "website", featured: true }),
  block("t-zine", "link", { title: "Zine no. 4", url: "https://example.com/zine", icon: "medium" }),
  block("t-letter", "link", { title: "Letter", url: "https://example.com/letter", icon: "email" }),
]

/** One of each block worth showing, with the plain-words label that sits beside it. */
export const catalog: { label: string; note: string; blocks: IBlock[] }[] = [
  {
    label: "Links",
    note: "Feature one, pair up the rest. Every tap is counted.",
    blocks: [shop, zine, letter],
  },
  {
    label: "Header and text",
    note: "Say who you are or split the page into parts.",
    blocks: [
      block("head", "header", { text: "New this month", level: 2 }),
      block("text", "text", { content: "Forty copies of each print, numbered and signed. When they are gone, they are gone.", align: "center" }),
    ],
  },
  {
    label: "Image",
    note: "One picture, with a caption if it needs one.",
    blocks: [block("image", "image", { src: "/landing/print-1.svg", alt: "Two-color print: a pink sun behind a blue arch", caption: "Arch, 2026. Two-color riso on 120 g paper." })],
  },
  {
    label: "Gallery",
    note: "Up to twenty images in a grid.",
    blocks: [
      block("gallery", "gallery", {
        images: [
          { src: "/landing/print-2.svg", alt: "Print: pink circle over a blue rectangle" },
          { src: "/landing/print-3.svg", alt: "Print: pink mountain on yellow" },
          { src: "/landing/print-4.svg", alt: "Print: blue stripes and a pink half circle" },
        ],
      }),
    ],
  },
  {
    label: "Social icons",
    note: "A row of the places people already follow you.",
    blocks: [social],
  },
  {
    label: "Countdown",
    note: "Count down to a launch, a drop or a show.",
    blocks: [block("countdown", "countdown", { title: "Print fair opens", targetDate: "2027-03-20T09:00:00.000Z" })],
  },
  {
    label: "Form",
    note: "Collect names, emails or orders. Answers land in your dashboard.",
    blocks: [
      block("form", "form", {
        title: "Get the studio letter",
        fields: [
          { label: "Email", type: "email", required: true },
          { label: "What should I print next?", type: "text", required: false },
        ],
        buttonText: "Sign me up",
      }),
    ],
  },
  {
    label: "Button",
    note: "One clear action: filled, outlined or plain.",
    blocks: [block("button", "button", { label: "Book a workshop", url: "https://example.com/workshops", variant: "primary", fullWidth: true })],
  },
]

/** The look of the block catalog: Riso's paper and inks, without its halftone. */
export const catalogTheme = resolveTheme({ preset: "riso", v2: { theme: "riso", background: { kind: "flat" } } })

/** Thirty days of made-up traffic for the plot. Fixed numbers so server and client agree. */
export const sampleTraffic: { day: string; views: number; taps: number }[] = [
  118, 131, 126, 149, 162, 204, 187, 143, 151, 158, 176, 193, 248, 231, 169, 174, 188, 206, 229, 301, 284, 212, 219, 236,
  251, 274, 362, 338, 263, 271,
].map((views, i) => ({
  day: `${i + 1}`,
  views,
  taps: Math.round(views * (0.34 + ((i * 7) % 5) * 0.025)),
}))

export const sampleBlockTaps: { label: string; kind: string; taps: number }[] = [
  { label: "Spring print run is open", kind: "Link", taps: 912 },
  { label: "Read zine no. 4", kind: "Link", taps: 547 },
  { label: "Book a workshop", kind: "Button", taps: 318 },
  { label: "Studio letter", kind: "Link", taps: 206 },
]

/** Every character a sample page shows, so theme fonts can be fetched as small subsets. */
export const sampleText = [
  samplePerson.name,
  samplePerson.bio,
  ...pickerBlocks.map((b) => String(b.data.title ?? b.data.label ?? "")),
].join(" ")
