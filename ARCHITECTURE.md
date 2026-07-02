# Architecture

## Design Decisions

### Page & User Models (embedded vs separate)
User and Page are **separate models** (1:1 relationship). This keeps auth concerns isolated from page content. The User model holds authentication data + plan, while Page holds display/theme/SEO settings. This also allows future flexibility (e.g., multiple pages per user on a Pro plan).

### Block Data Payload
Blocks use a `data` field of type `Schema.Types.Mixed` — a JSON blob shaped by `type`. Each block type has its own Zod schema for validation (`lib/validation.ts`). New block types can be added by:
1. Adding the type to the `BlockType` union in `types/index.ts`
2. Adding a Zod schema in `validation.ts`
3. Creating a renderer component in `components/blocks/`
4. Adding an editor in `components/dashboard/sortable-block.tsx`

### Rendering Strategy
The public `/[username]` page uses **dynamic server rendering** (not SSG). Every request fetches the user, page, and blocks from MongoDB. This ensures edits are reflected immediately without revalidation complexity. For high-traffic profiles, this could be upgraded to ISR with on-demand revalidation triggered by the dashboard.

### Auth Flow
Auth.js v5 with the JWT strategy (no database sessions). The `credentials` provider uses bcrypt for password hashing. The `proxy.ts` file (Next.js Proxy, formerly Middleware) protects dashboard routes at the network boundary. Server Actions also validate ownership independently.

### Drag & Drop
`@dnd-kit/core` + `@dnd-kit/sortable` powers the block reordering. On drag-end, bulk `Block.updateMany` is called via a Server Action to persist the new order atomically.

### Analytics
Click events are stored in a dedicated `ClickEvent` collection. Tracking is anonymous — no IPs, no user agents, no PII. Rate limiting (in-memory Map, 60 req/min per key) protects public endpoints. Page views are tracked via a `blockId: "pageview"` convention.

### Scheduling
Blocks have optional `startAt` / `endAt` fields. The public page query applies date filtering at read time. Dashboard toggle (`isActive`) is separate from scheduling for explicit control.

## Data Model

```
┌─────────────────┐      ┌─────────────────┐
│      User       │      │      Page       │
├─────────────────┤      ├─────────────────┤
│ _id             │1──1  │ _id             │
│ email (unique)  │      │ userId (FK)     │
│ passwordHash    │      │ title           │
│ username (uniq) │      │ bio             │
│ name            │      │ theme (object)  │
│ avatarUrl       │      │ seo (object)    │
│ plan            │      │ isPublished     │
│ createdAt       │      │ createdAt       │
└─────────────────┘      └─────────────────┘
                               │
                               │ 1:N
                               ▼
                         ┌─────────────────┐
                         │      Block      │
                         ├─────────────────┤
                         │ _id             │
                         │ pageId (FK)     │
                         │ type (enum)     │
                         │ order (number)  │
                         │ data (mixed)    │
                         │ startAt?        │
                         │ endAt?          │
                         │ isActive        │
                         └─────────────────┘
                               │
                         ┌────┴─────────────┐
                         ▼                   ▼
                  ┌──────────────┐   ┌──────────────┐
                  │  ClickEvent  │   │FormSubmission│
                  ├──────────────┤   ├──────────────┤
                  │ blockId      │   │ blockId      │
                  │ pageId       │   │ pageId       │
                  │ timestamp    │   │ data (mixed) │
                  │ referrer?    │   │ submittedAt  │
                  └──────────────┘   └──────────────┘
```

## Indexing Strategy

- `User.email` — unique index (login lookup)
- `User.username` — unique index (public page lookup)
- `Block.pageId + order` — composite index (block list query, ordered)
- `Block.pageId + isActive + startAt + endAt` — composite index (public page block filter)
- `ClickEvent.pageId + timestamp` — composite index (analytics queries)
- `ClickEvent.timestamp` — index (time-range queries)

## Key Design Choices

| Decision | Rationale |
|----------|-----------|
| Mongoose over Prisma | MongoDB-native, simpler free-tier setup, no generation step |
| Server Actions over API Routes | Co-located mutations, progressive enhancement, built-in revalidation |
| JWT strategy over database sessions | No session collection to manage, simpler at free-tier scale |
| In-memory rate limiting | Simple, no external dependency; resets on server restart |
| Separate Block model | Enables drag-drop reordering with `order` field, extensible block types |
| Theme as JSON on Page | Avoids a separate Theme model; simple for current feature set |

## Block Type System

Each block type follows a consistent interface:

```
Input:  user selects type → default data generated → editor form displayed
Render: BlockRenderer dispatches to type-specific component
Store:  Zod-validated JSON in Block.data
```

Adding a new block type requires changes in 4 files + 1 new component:
- `types/index.ts` — add to `BlockType` union
- `lib/validation.ts` — add Zod schema for data payload
- `components/dashboard/sortable-block.tsx` — add editor component
- `components/blocks/block-renderer.tsx` — register renderer
- `components/blocks/` — create new renderer component
