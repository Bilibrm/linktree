# LinkNest Design System

## Concept: Waypoints

LinkNest turns a person's scattered links into a personal trail — a single path visitors follow. The visual metaphor is a hand-drawn trail line that runs through the landing page, with waypoint markers at each onboarding step (sign up → customize → publish → grow).

This is the signature structural idea. Everything else stays quiet around it.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#0F211D` | Primary dark background (deep forest-teal, not pure black) |
| `--surface` | `#17332C` | Elevated cards/panels on dark background |
| `--bone` | `#E7DFC9` | Light background / light-mode surface, warm parchment |
| `--pine` | `#16302A` | Primary text on light surfaces |
| `--gold` | `#D2A24C` | Primary accent — CTAs, active states, trail line |
| `--coral` | `#DD5B39` | Secondary accent — hover, highlights, error/attention sparingly |

### Color Rules
- Gold is the primary action color. Coral is for emphasis only.
- If coral appears more often than gold anywhere, pull it back.
- Dark mode default for dashboard, light mode (`--bone`) available via toggle.

---

## Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display | Fraunces (variable serif) | 700–900 | Hero, section headlines |
| Body | Public Sans | 400, 500, 600 | UI text, paragraphs, labels |
| Mono | IBM Plex Mono | 400, 500, 600 | Analytics numbers, code, data |

### Type Scale

| Token | Size | Line Height | Weight | Used For |
|---|---|---|---|---|
| `display-xl` | 4.5rem | 0.9 | 900 | Hero headline only |
| `display-lg` | 3rem | 1.05 | 800 | Major section headings |
| `display` | 2rem | 1.1 | 700 | Section headings |
| `heading` | 1.25rem | 1.3 | 600 | Card titles, subheadings |
| `body` | 1rem | 1.6 | 400 | Body copy, paragraphs |
| `caption` | 0.875rem | 1.5 | 400 | Meta text, labels |
| `small` | 0.75rem | 1.4 | 400 | Footnotes, timestamps |

### Type Rules
- No arbitrary `text-4xl` / `text-sm` scattered — use the named tokens above.
- Fraunces at high weight for display, restrained elsewhere.
- Body text never below 1rem on any screen size.

---

## Spacing & Density

| Token | rem | px | Used For |
|---|---|---|---|
| `space-xs` | 0.25rem | 4px | Inset padding, icon gaps |
| `space-sm` | 0.5rem | 8px | Element gaps, small padding |
| `space-md` | 1rem | 16px | Default spacing unit |
| `space-lg` | 2rem | 32px | Section padding, card gaps |
| `space-xl` | 4rem | 64px | Major section spacing |
| `space-2xl` | 8rem | 128px | Page section separation |

Spacing density presets for user customization:
- **compact**: reduces all spacing by 25%
- **comfortable**: default as above
- **spacious**: increases all spacing by 50%

---

## Elevation

Three elevation levels used consistently across all components:

| Level | Token | Shadow | Usage |
|---|---|---|---|
| Flat | `elevation-flat` | none | Base surface, cards at rest |
| Raised | `elevation-raised` | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)` | Hovered cards, active elements |
| Floating | `elevation-floating` | `0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)` | Dropdowns, modals, dialogs |

### Elevation Rules
- Cards use `elevation-flat` by default, transition to `elevation-raised` on hover.
- Modals/dropdowns use `elevation-floating`.
- On dark backgrounds, use `border-white/5` instead of shadows for separation.
- Drag state: dragged elements use `elevation-floating` + `border-gold/30`.

---

## Animation

| Property | Value |
|---|---|
| Default duration | 400ms |
| Default easing | cubic-bezier(0.22, 1, 0.36, 1) — ease-out-quart |
| Scroll trigger start | "top 85%" |
| Reduced motion | Respect `prefers-reduced-motion`: fall back to opacity fades, no parallax |

### Animation Approach
- GSAP + ScrollTrigger for all scroll-driven animations.
- All GSAP instances are registered in a single `gsap.context()` per component, cleaned up on unmount to prevent App Router memory leaks.
- ScrollTrigger instances are killed in the cleanup function.
- `gsap.matchMedia()` handles responsive animation variants (simplify on mobile).
- Three animation moments only (not everything that enters the viewport):
  1. Trail line draw-in (`stroke-dashoffset`)
  2. Waypoint marker activation
  3. Section content entry fade

### Cursor Interaction
- Hero section has a single cursor-follow effect: a small waypoint marker that subtly follows mouse movement within the hero area.
- Uses `gsap.to()` with `power2.out` easing for smooth tracking.
- Hidden on mobile / touch devices.
- One deliberate interaction — no cursor effects elsewhere.

---

## Icons

- **Primary set: Iconsax** (`iconsax-react` npm package) — 1000+ icons in 6 styles.
- Use `Linear` variant as default, `Bulk` for filled states.
- Standardize on Iconsax for all application-level components.
- shadcn UI primitives (checkbox, command, select, dialog, sheet, dropdown-menu, sonner) retain Lucide internally — do not modify these.
- No emoji as icons anywhere.

---

## Component Shapes

### Buttons
| Variant | Radius | Height | Padding | Style |
|---|---|---|---|---|
| Primary | `rounded-xl` (0.75rem) | 2.5rem (h-10) | px-5 | Gold bg, ink text, font-semibold |
| Secondary | `rounded-xl` | 2.5rem | px-5 | Transparent bg, gold border, gold text |
| Ghost | `rounded-lg` (0.5rem) | auto | px-3 py-2 | No bg/border, muted text, hover: bg-white/5 |
| Link | none | auto | p-0 | Text only, underline on hover |

### Cards
- `rounded-xl` border radius.
- Dark mode: `bg-surface/50 border-white/5`.
- Hover: transition to `elevation-raised` or `border-white/10`.
- No heavy shadows on dark backgrounds — use border color shifts.

### Inputs
- `rounded-xl` border radius.
- Dark mode: `bg-ink border-white/5 text-bone`.
- Focus: `border-gold/50 ring-gold/20`.
- Error: `border-coral/50`.
- Height: `h-10` (2.5rem) standard, `h-11` on auth forms.

---

## Layout Patterns

### Landing Page
- Full-width dark (`--ink`) background.
- SVG trail line on left side (desktop), topographic contour parallax.
- Sections centered at `max-w-3xl` or `max-w-5xl`.
- Waypoint cards stagger along the trail — alternating left/right alignment (desktop).
- Block showcase uses real rendered previews at slight angles, not icon-in-a-box grids.
- Comparison section: honest feature table styled as trail narrative.
- FAQ: accordion with `+`/`×` toggle, gold accent.

### Auth Pages
- Split-screen layout (desktop): brand panel (45%) + form panel (55%).
- Brand panel: `--ink` bg, topographic contours, short trail-voice copy, LinkNest wordmark.
- Form panel: `--bone` bg, clean form styling with gold focus rings.
- Mobile (<1024px): brand panel collapses to compact header strip.
- Password visibility toggle, inline validation, loading spinner on submit.

### Dashboard
- Default: dark mode (`--ink` bg, `.dark` class on wrapper).
- Light mode toggle in sidebar (Sun/Moon icon), persisted to localStorage.
- Sidebar: collapsible (4rem collapsed / 14rem expanded), `bg-sidebar` CSS variable.
- Active nav: gold left-border accent (3px rounded pill) + gold text + gold/10 bg.
- Block editor: real block card previews (not generic rows), drag handle with `GripVertical` icon.
- Appearance panel: full theme customization with live previews.
- Analytics: IBM Plex Mono for numbers, gold chart line, bone bar fills.

---

## Trail Motif

The signature element: an SVG path line running vertically through the landing page behind sections.

- Hand-drawn feel (slight bezier curve, not a straight vertical line).
- Stroke draws in via `stroke-dasharray`/`stroke-dashoffset` animation driven by ScrollTrigger.
- Waypoint markers (small circles at each step) shift from `--surface` to `--gold` with a subtle scale bounce as they're reached.
- Background: faint topographic contour lines at 2–3 depth layers, parallax-scrolled slowly for depth.
- Waypoint cards stagger vertically and alternate alignment to read as a real path, not a features grid.

On mobile (<768px): trail simplifies to a straight vertical line, no topographic layers.

---

## Micro-Interactions

- **Buttons**: hover states use subtle opacity shift (`hover:opacity-90`) + gold underglow on primary. No generic scale-up.
- **Cards**: hover transitions border from `white/5` to `white/10` and optionally applies `elevation-raised`.
- **Links**: color transition to gold on hover.
- **Nav items**: background fades to `white/5` on hover, active state has gold left-border pill.
- **FAQ items**: smooth `maxHeight` transition for accordion open/close.
- **Block cards**: subtle border color shift on hover, gold border + shadow on drag.
