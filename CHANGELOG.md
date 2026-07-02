# Changelog

## [0.2.0] — 2026-07-02

### Landing Page
- Staggered waypoint cards — alternating left/right alignment along the trail line instead of uniform grid
- Real rendered block previews in showcase section (actual link buttons, social icon row, embed frame, form) arranged at slight angles
- Cursor-follow waypoint marker in hero section (single restrained interaction, hidden on mobile)
- New comparison section: "LinkNest vs. a basic link page" feature table styled as trail narrative
- New FAQ section: accordion with 6 real questions (pricing, domains, data ownership, blocks, open source)
- Copy pass — removed generic SaaS language ("unlock your potential," "seamlessly"), kept plain trail voice
- Micro-interactions: subtle border/color transitions on hover, no generic scale-up

### Auth Pages
- Full split-screen redesign — brand panel (ink bg, topographic contours, trail-voice copy) + form panel (bone bg)
- On-brand form styling: gold focus rings, coral error states, rounded-xl inputs
- Password visibility toggle with smooth icon transition
- Loading spinner on submit (not just disabled button)
- Inline username availability check with gold checkmark / coral X
- Mobile responsive — brand panel collapses to compact header strip below 1024px
- LinkNest wordmark consistent with landing page header

### Dashboard
- Sidebar: gold left-border accent on active nav item (3px rounded pill), Sun/Moon light mode toggle
- Light mode toggle persisted to localStorage via DashboardThemeProvider
- Block editor: real block card previews showing what each block looks like on the public page
- Drag handle: GripVertical icon with proper cursor states, gold border + shadow on drag
- Block type picker: styled grid with descriptions, not plain button+dropdown
- Empty state: on-brand copy ("Your trail starts here") with styled CTA
- Analytics: IBM Plex Mono for numbers, gold chart line, bone bar fills, prominent stat cards
- Settings: design system typography, on-brand form styling, coral-accented logout section
- All icons standardized on Lucide (application level), shadcn primitives untouched

### Design System
- Added Elevation levels (flat, raised, floating) with consistent usage rules
- Added Component Shapes section (buttons, cards, inputs with exact specs)
- Added Layout Patterns (landing, auth split-screen, dashboard)
- Added Micro-Interactions section
- Updated Icons section to reference Iconsax as primary set (shadcn primitives retain Lucide)
- Updated Trail Motif with staggered waypoint card behavior
- Updated Animation with cursor interaction rules

### Technical
- DashboardThemeProvider context for dark/light mode toggle (persists to localStorage)
- PublicPageClient supports password gate UI with verifyPagePassword server action
- Noindex meta tags for unlisted/password-protected pages
- IPage type extended with visibility and pageHasPassword fields
- Build passes with zero TypeScript errors
