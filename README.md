# LinkNest

Your link-in-bio page, elevated. A rich, flexible alternative to Linktree — with multiple block types, themes, analytics, scheduling, and drag-and-drop editing.

## Features

- **Multiple block types** — links, headers, text, dividers, social icons, images, galleries, embeds (YouTube/Spotify), forms, countdowns
- **Drag-and-drop editor** — reorder blocks instantly with live preview
- **Theming** — 8 curated presets + custom colors, fonts, button styles, backgrounds (solid/gradient/image)
- **Scheduling** — set start/end dates to auto-show/hide blocks
- **Analytics** — per-link click counts, page views, daily activity, top links
- **SEO** — per-page meta title, description, OG image
- **QR code** — auto-generated on every public page
- **Username availability** — real-time check on signup
- **Cloudinary uploads** — avatars, backgrounds, block images
- **Mobile-first** responsive public pages, Lighthouse 90+ target

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Server Components, Server Actions)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: MongoDB via Mongoose
- **Auth**: Auth.js v5 (NextAuth) — credentials (email/password, bcrypt)
- **Drag & drop**: @dnd-kit/core + @dnd-kit/sortable
- **Charts**: recharts-powered analytics dashboard
- **Validation**: Zod (shared client/server)
- **Media**: Cloudinary (free tier)
- **QR**: qrcode.react
- **Hosting**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas free cluster (or local MongoDB)
- Cloudinary free account (optional, for media uploads)

### Local Setup

```bash
# 1. Clone and install
git clone <repo-url> linknest
cd linknest
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials (see DEPLOYMENT.md)

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up, then head to `/dashboard` to build your page.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
linknest/
├── app/
│   ├── [username]/          # Public profile page (dynamic route)
│   ├── (dashboard)/         # Dashboard layout (authenticated)
│   │   └── dashboard/
│   │       ├── page.tsx           # Block editor
│   │       ├── analytics/page.tsx # Analytics dashboard
│   │       ├── appearance/page.tsx# Theme editor
│   │       └── settings/page.tsx  # Page & account settings
│   ├── auth/login/          # Login page
│   ├── auth/signup/         # Signup page
│   ├── api/auth/            # Auth.js route handler
│   ├── layout.tsx
│   ├── page.tsx             # Landing page
│   └── globals.css
├── components/
│   ├── blocks/              # Block renderers (one per type)
│   ├── dashboard/           # Dashboard components
│   ├── shared/              # Shared components
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── actions/             # Server Actions
│   ├── db/mongoose.ts       # DB connection
│   ├── models/              # Mongoose models
│   ├── auth.ts              # Auth.js configuration
│   └── validation.ts        # Zod schemas
├── types/                   # TypeScript types
├── proxy.ts                 # Auth middleware
├── .env.example
├── ARCHITECTURE.md
├── API.md
├── DEPLOYMENT.md
└── CHANGELOG.md
```

## License

MIT
