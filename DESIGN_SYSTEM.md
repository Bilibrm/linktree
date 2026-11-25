# LinkNest Design System — v2 "Press"

Single source of truth for every LinkNest surface. The installed skills (frontend-design,
impeccable, design-taste-frontend, ui-ux-pro-max, struq) are **critics**, not authors:
when one of them disagrees with this file, this file wins unless it is updated first.

v1 ("Waypoints": dark forest green, gold, Fraunces) is retired. It sat too close to the
generic "dark + serif + warm metallic accent" default and the brief asked for a new UI.

---

## 1. Subject, audience, job

- **Subject:** a free, open-source link-in-bio builder. One public page per person, assembled
  from blocks (links, header, text, image, gallery, video, embed, social, form, countdown,
  button, divider, spacer).
- **Audience:** creators, freelancers, small makers and local businesses. Many share the page
  from a phone, in a bio, on a flyer or a QR code.
- **Primary job:** claim a name, stack blocks, share one URL.

## 2. Concept: Press

A LinkNest page is a small printed thing: a handbill you compose, proof, and pass around.
The language borrows from **risograph printing** — paper stock, two spot inks, slight
overprint where the inks cross. It suits the audience (zines, flyers, posters, merch)
and it is not the SaaS default.

Vocabulary follows the metaphor lightly, never at the cost of clarity:
the editor shows a **proof** (live preview); everything else uses plain words
(Add block, Saved, Copy link). Do not rename standard actions into print jargon.

**Boldness lives in one place per surface:**

| Surface | The one bold thing | Everything else |
|---|---|---|
| Landing | Hero: a page being composed live, headline overprinted in two inks | Quiet paper sections |
| Auth | Name-claim field that previews `linknest-dz.vercel.app/<name>` as you type | Plain form |
| Editor | The proof itself — the real page, editable in place | Neutral chrome |
| Analytics | One large views/clicks plot in ink | Plain tables |
| Public page | The owner's theme | LinkNest mark is tiny |

## 3. Color

Two spot inks on paper. Pink is the only action color. Blue is the text/ink color.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#ECEDE8` | App + landing background (cool newsprint, not cream) |
| `--sheet` | `#F8F8F5` | Raised surfaces: inspector, inputs, menus |
| `--ink` | `#1C2A63` | Primary text, icons, rules, chart lines (Riso-blue ink) |
| `--ink-soft` | `#55608F` | Secondary text, placeholders (check 4.5:1 on paper) |
| `--pink` | `#FF4FA3` | Primary actions, selection, focus ring, active nav |
| `--pink-ink` | `#C2186F` | Pink used as text/links on paper (AA contrast) |
| `--sun` | `#FFE14D` | Highlight only: text selection, "new" marker, empty-state mark |
| `--overprint` | `#7A2E8E` | Where pink crosses blue (hero only, via `mix-blend-mode: multiply`) |
| `--danger` | `#D23A2A` | Destructive confirm only |

Dark mode ("darkroom"): `--paper #0F1533`, `--sheet #18204A`, `--ink #E9EAF2`,
`--ink-soft #A3A9C8`, pink unchanged. Dashboard follows system; toggle stays.

### 3.1 The ink drawer (landing + themes)

A print shop owns more than two inks. The landing page and the theme system draw from
this wider set of spot colors, always printed in **pairs** over paper, with overprint
(multiply) where they cross:

| Ink | Hex | Ink | Hex |
|---|---|---|---|
| Fluor pink | `#FF4FA3` | Federal blue | `#1C2A63` |
| Sunflower | `#FFD23F` | Teal | `#00838A` |
| Orange | `#FF6B2C` | Grass | `#18A558` |
| Sky | `#4FB3E8` | Scarlet | `#E8352E` |

**Where the drawer is used (revised, gallery-minimal brief):** the full drawer belongs to
the **owner themes**. The LinkNest marketing site and app stay on paper + ink with pink as
a sparse accent; the other inks appear on the landing only *inside* the theme proofs and
showcase frames, never as section backgrounds. No section-by-section ink crossfades.

Rules:
- Never pure-grey UI chrome. Neutrals are tints of ink on paper.
- In the app, pink covers < 10% of any screen. One filled pink button per view.
- Color richness comes from flat spot inks, overprint, halftone dots and grain, not
  from soft multi-stop gradients or glows. Grain/halftone texture allowed on landing and
  in themes that choose it.
- No purple-to-blue SaaS gradient, ever. `--overprint` appears only as a blend result.

## 4. Type

One family, used through its width axis: **Archivo** (Google Fonts, variable `wght` 100–900,
`wdth` 62–125) via `next/font/google` with `axes: ["wdth"]`.

| Token | Size / line | Weight / width | Use |
|---|---|---|---|
| `display` | clamp(3rem, 9vw, 7.5rem) / 0.88 | 850 / 125 (expanded) | Landing hero only |
| `title-1` | clamp(2rem, 4vw, 3rem) / 1.0 | 800 / 115 | Section and page titles |
| `title-2` | 1.5rem / 1.15 | 700 / 105 | Panel titles |
| `title-3` | 1.125rem / 1.3 | 650 / 100 | Card and block titles |
| `body` | 1rem / 1.55 | 400 / 100 | Default text |
| `small` | 0.875rem / 1.45 | 450 / 100 | Help text, meta |
| `micro` | 0.75rem / 1.3 | 600 / 100 | Badges, counters (sentence case) |

Rules:
- Numbers use `font-variant-numeric: tabular-nums`. No monospace face for data labels.
- No ALL-CAPS tracked eyebrows. No single italic/colored word in headlines.
- No `→` glued onto button text. Buttons say what happens.
- Body never below 1rem on public pages; 0.875rem allowed for dashboard meta.
- Public pages keep the owner's chosen font pair (existing `fontPairs`); Archivo is the
  LinkNest default pair.

## 5. Shape, space, elevation

- Radius scale with meaning: `2px` inputs/tags (printed-label feel), `10px` panels and
  blocks, `999px` only for avatar and toggle. Not one radius everywhere.
- Spacing: 4px base. Dashboard density: 8 / 12 / 16 / 24. Landing: 24 / 48 / 96 / 160.
- Elevation is **ink, not shadow**: surfaces separate by a 1px `--ink` at 12% rule.
  Dragged block: 2px solid ink outline + 4px offset "misregistered" pink duplicate behind
  (`box-shadow: 4px 4px 0 var(--pink)`). Menus/dialogs: same offset-shadow at 3px in ink 20%.
  No `rgba(0,0,0,.1)` blur shadows.

## 6. Motion

**Revised brief (owner, latest):** keep all content, pages and functionality; raise visual
craft toward minimalist gallery / studio-template sites (Minimal Gallery, One Page Love,
Nightshelf / Melune / Moorline): generous whitespace, crisp type hierarchy, hairline
dividers, room to breathe. Motion is **smooth, tactile, weighted, never flashy**.
The print metaphor stays as quiet character (paper, ink, one accent, a faint 2–3px
misregistration on the hero headline), not as spectacle.

### 6.1 Landing — scroll choreography (GSAP + ScrollTrigger + Lenis)

- **Weighted smooth scroll:** Lenis on `/` only (lerp ≈ 0.08–0.1), synced to GSAP's ticker.
  Off under reduced motion; native on touch.
- **Hero depth:** on load, headline lines rise in once with a soft stagger (clip mask, no
  bounce); as you scroll past the fold the hero content scales to ~0.96 and drifts up/fades
  slightly; the proof frame moves at a slower rate than the text.
- **Image parallax:** every showcase visual (proofs, theme frames, print images) sits in a
  clean clipped frame (`overflow: hidden`, hairline border); the inner image is ~110–115%
  tall and translates −5% → +5% across the frame's travel. Text never parallaxes.
- **Sticky split-screen:** "What you can put on it" and "Make it yours" are split
  sections: the title + short narrative stays pinned on the left (CSS `position: sticky`
  preferred over GSAP pins) while block cards / theme frames glide past on the right.
  The active item's label in the narrative updates as its card passes centre.
- **Soft reveals:** headings (line by line), hairline dividers (scaleX 0 → 1 from left),
  and grid items ease in once in sequence (opacity + 12–16px rise, 600–800ms,
  `cubic-bezier(0.22, 1, 0.36, 1)`, 60–80ms stagger) when their section reaches ~80% of
  the viewport. Not on every paragraph; never re-hidden on scroll up.
- **Stats:** the line chart draws on once; numbers count up once.
- **Hover:** understated and crisp: links draw an underline from the left; buttons shift
  1px and darken; cards lift 2px with the hairline darkening; images inside frames
  scale 1.02. 150–220ms.
- No horizontal scroll-jacked tracks, no section color crossfades, no ink separation
  effects, no looping ambient motion on the marketing site.
- Decorative assets: minimal. Prefer real showcase material (theme proofs, print images,
  CC0 photography of makers/creators run through a subtle ink duotone) in clipped frames.
- Layout: landing spacing scale 32 / 64 / 128 / 192; max text measure ~60ch; hairline
  (1px ink at 12–16%) section dividers; one idea per screen.
- Performance: animate only `transform`/`opacity`/`clip-path`; `will-change` scoped;
  `gsap.matchMedia()` for desktop vs mobile variants (mobile: lighter, no pins that trap
  scroll on short screens); everything inside `gsap.context()` and reverted on unmount.
  Keep LCP text visible without JS.

### 6.2 App (auth, dashboard, editor)

- CSS transitions / WAAPI, 150–260ms, `cubic-bezier(0.2, 0, 0, 1)`; springy only for
  drag-drop settle. Motion answers an action and shows what changed:
  block inserted (prints in: clip-path wipe top→bottom), reordered (FLIP slide),
  deleted (lifts away; undo prints it back), inspector swaps (short slide), theme change
  (proof crossfades), save state ticks.
- Page transitions between dashboard tabs: subtle View Transitions API crossfade where
  supported.
- No looping or ambient animation in the app.

### 6.3 Public pages

Themes may ship an **entrance** (stagger print-in, slide, fade, none) and a **hover**
style (lift, offset-shadow, ink fill, underline), plus optional ambient background motion
(slow halftone drift, grain shimmer) that pauses when off-screen. Visitors' reduced-motion
setting always wins.

### 6.4 Global

- `prefers-reduced-motion`: final states, no parallax/pins/smooth scroll, instant transitions.
- Remove `react-parallax`, `react-magic`, and `@react-spring/web` once nothing imports them.

## 7. Iconography

Lucide only (already a dependency, used by shadcn primitives). Drop `iconsax-react` once
unused. 1.75px stroke, 18px in dashboard, 20px on public pages. Platform/brand glyphs stay
in `components/blocks/platform-icons.tsx`. No emoji as icons.

## 8. Surfaces

### 8.1 Landing `/`

```
┌──────────────────────────────────────────────────────────────┐
│ LinkNest                                    Log in  [Claim]  │
│                                                              │
│  ONE PAGE                     ┌─────────┐                    │
│  FOR ALL OF IT.  (expanded,   │ proof   │  blocks drop in    │
│  pink+blue overprint)         │ @amina  │  one by one; theme │
│                               │ [link]  │  swaps once        │
│  linknest-dz.vercel.app/[____]│ [video] │                    │
│  [Claim this name]            │ [form]  │                    │
│                               └─────────┘                    │
├──────────────────────────────────────────────────────────────┤
│ What you can put on it — real rendered blocks, not cards     │
│ (actual BlockRenderer output in a loose column, labeled)     │
├──────────────────────────────────────────────────────────────┤
│ Make it yours — one theme picker, the proof restyles live    │
├──────────────────────────────────────────────────────────────┤
│ See who taps — the real analytics plot with sample data      │
├──────────────────────────────────────────────────────────────┤
│ Free and open source. [Claim your name]  · footer            │
└──────────────────────────────────────────────────────────────┘
```

- Hero is left-aligned on desktop, stacked on mobile (name field first, proof below).
- The name field is real: it normalizes input and links to `/auth/signup?username=<name>`.
- Sections use real product components (`BlockRenderer`, theme presets, chart), not
  illustrations of them. No three-identical-card rows. No fake logos or testimonials.
- Copy: plain, specific, second person. No "Unlock", "Elevate", "Seamless".

### 8.2 Auth `/auth/login`, `/auth/signup`

Single column on paper, max 400px, left-aligned. Signup leads with the name field and a
live URL preview plus availability state (available / taken / invalid, said in words,
not only color). Prefill from `?username=`. Errors say what failed and how to fix it.

### 8.3 Dashboard shell

```
┌────┬───────────────────────────────────────────┬──────────────┐
│ LN │ linknest-dz.vercel.app/amina  [Copy][QR]  Saved ✓        │
│    ├───────────────────────────────────────────┼──────────────┤
│Page│                                           │ Inspector    │
│Look│          ┌───────────────┐                │ (selected    │
│Stat│          │  PROOF        │                │  block or    │
│Set │          │  (real page,  │                │  page look)  │
│    │          │  phone width) │                │              │
│    │          │  + between    │                │              │
│    │          └───────────────┘                │              │
└────┴───────────────────────────────────────────┴──────────────┘
```

- Left rail 64px, icon + short label: Page, Look, Stats, Settings.
- Top bar: public URL (copy, QR, open), save state ("Saving…" / "Saved" / "Not saved — retry").
- Mobile (<768px): rail becomes a bottom tab bar; inspector becomes a bottom sheet.

### 8.4 Editor `/dashboard` — the core UX

The proof **is** the editor. It renders the real public page with the owner's theme using
the same `BlockRenderer` as `/[username]`, so what you edit is what visitors see.

- **Select:** click/tap a block on the proof → pink 2px outline, inspector shows its fields.
  Escape deselects. Empty selection → inspector shows page basics (name, bio, avatar).
- **Add:** hover/focus a gap between blocks → `+` insertion line. Click it, or press `/`
  or `Ctrl/⌘+K`, to open a block picker (cmdk) with search and a one-line description per
  type. The new block inserts at that gap and is selected with its first field focused.
- **Reorder:** drag handle on the selected/hovered block (dnd-kit, existing). Keyboard:
  `Alt+↑/↓` moves the selected block. The moved block flashes its offset-pink shadow once.
- **Edit:** inspector fields save on blur/debounce (existing autosave), proof updates live.
- **Hide/delete:** visibility toggle in inspector; delete removes immediately with an
  "Undo" toast (sonner) for 6s — no confirm dialog.
- **Empty page:** proof shows the owner's header plus one insertion point:
  "Add your first block" with three suggested types (Link, Social, Text).
- Inspector field order: content fields first, then options (style, schedule, visibility),
  then danger (delete) last.
- Existing per-type editors in `block-editors.tsx` are reused/restyled, not rewritten
  from scratch, unless needed for the inspector layout.

### 8.5 Look `/dashboard/appearance`

Same shell. The proof stays center; inspector shows theme controls grouped as
Presets → Colors → Type → Buttons → Background → Advanced (custom CSS). Changing a control
restyles the proof immediately. Presets render as tiny proofs, not color swatches.

### 8.6 Stats `/dashboard/analytics`

One large plot (views and clicks, 7/30/90-day toggle), drawn as ink lines on paper with
the pink series for clicks. Below: per-block clicks table in page order with the block's
label, sparkline-free, tabular numbers. Empty state explains views appear after sharing
the link, with Copy link button.

### 8.7 Settings `/dashboard/settings`

Plain sectioned form: Profile, Account, Danger zone. Danger actions require typing the
username.

### 8.8 Public `/[username]`

Owner's theme governs. Defaults (new pages) use Press tokens: paper background, ink text,
pink-outlined link blocks. Footer: tiny "Made with LinkNest" link. Must score well on
mobile LCP: no client JS beyond what blocks need (form, countdown, video facade).

### 8.9 Theme system v2 (owner themes)

The theme system may be rebuilt. A theme is a **composed recipe**, not a color pick:

| Layer | Options (examples) |
|---|---|
| Palette | background, surface, text, accent, accent-text (contrast-checked) |
| Type | font pair (display + body) from a curated list with real character |
| Layout | `stack` (classic centered), `editorial` (left-aligned, big name), `cover` (full-bleed header image/color band), `grid` (2-col tiles for links/images), `poster` (oversized type header) |
| Block style | `filled`, `outline`, `offset` (riso offset shadow), `ticket` (perforated edge), `glass`-free soft, `underline` (text-only list) |
| Shape | sharp / soft / round / pill |
| Background | flat, duotone gradient (2 stops max), halftone dots, grain, paper texture, pattern (grid, stripes, confetti shapes), image with ink overlay, slow animated (halftone drift / blob morph) |
| Motion | entrance (print-in / slide / fade / none), hover (lift / offset / ink-fill / underline) |

Ship **12–16 curated themes** that each feel like a different print object, e.g.
`Riso` (pink+blue overprint, LinkNest default), `Darkroom` (deep blue-black, red safelight
accent), `Blueprint` (cyan line grid, white mono-free type), `Terrazzo` (speckle pattern,
warm stone), `Night Market` (neon-sign accents on near-navy, flicker hover),
`Botanical` (pressed-leaf greens, editorial layout), `Ticket Stub` (perforated
ticket blocks), `Zine` (photocopy grain, cut-paper offsets, sticker labels),
`Poster` (oversized grotesk name, two-ink), `Sunday Paper` (newsprint, columns, still
readable), `Arcade` (chunky pixel-shadow buttons, bright primaries), `Tape` (masking-tape
labels on kraft), `Ocean Print` (teal+sunflower duotone), `Monochrome` (one ink, crisp).
Names describe the look in plain words. Each theme gets a tiny live proof in the picker.

Owners can start from a theme and override any layer. Old stored theme documents must map
onto v2 (migration function at read time, no DB rewrite required): unknown/old fields →
closest v2 values, never a crash or blank page.

## 9. Quality floor (every slice)

- Responsive 360px → 1440px, no horizontal scroll.
- Visible focus (`2px solid var(--pink)`, 2px offset) on every interactive element.
- WCAG AA contrast; state never conveyed by color alone.
- Hit targets ≥ 44px on touch.
- Reduced motion respected.
- Lint and build clean.

## 10. Hard engineering constraints

- Block, page, and theme **schemas stay backward-compatible** (`lib/validation.ts`,
  `lib/models/*`). Production pages exist. New fields must be optional with defaults.
- Server actions keep ownership checks. No new env vars without updating `.env.example`.
- Free tiers only. No new paid services.
- Update Playwright selectors in `e2e/` when markup changes; keep `#username`, `#name`,
  `#email`, `#password` ids on auth forms.
