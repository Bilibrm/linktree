# API Documentation

All mutations use **Server Actions** (`"use server"`). Public read routes are standard Server Components fetching from the database directly.

## Server Actions

### Auth

#### `signupAction(formData: FormData)`
Registers a new user and creates their page. Signs the user in on success.
- **Input**: `email`, `password`, `username`, `name` (optional)
- **Output**: `{ success: true }` or `{ error: string, field?: string }`
- **Auth**: Public

#### `loginAction(formData: FormData)`
Authenticates with credentials.
- **Input**: `email`, `password`
- **Output**: `{ success: true }` or `{ error: string }`
- **Auth**: Public

#### `loginActionRaw(values: { email: string, password: string })`
Like `loginAction` but accepts a JSON object instead of FormData.
- **Auth**: Public

#### `logoutAction()`
Signs out the current user.
- **Auth**: Authenticated

#### `checkUsername(username: string)`
Checks if a username is available.
- **Output**: `{ available: boolean, error?: string }`
- **Auth**: Public

### Page

#### `getMyPage()`
Returns the current user's page document.
- **Auth**: Authenticated (session owner)

#### `updateMyPage(formData: FormData)`
Updates page title, bio, theme, SEO, publish status.
- **Input**: `title`, `bio`, `theme` (JSON string), `seo` (JSON string), `isPublished`
- **Auth**: Authenticated (session owner)
- **Revalidates**: `/dashboard`, `/[username]`

#### `getMyUser()`
Returns the current user (excluding passwordHash).
- **Auth**: Authenticated

#### `updateMyProfile(formData: FormData)`
Updates user name and avatar.
- **Input**: `name`, `avatarUrl`
- **Auth**: Authenticated

### Blocks

#### `getBlocks(pageId: string)`
Returns all blocks for a page, ordered.
- **Auth**: Authenticated (page owner)

#### `createBlock(formData: FormData)`
Creates a new block with default data for the given type.
- **Input**: `pageId`, `type`, `data` (JSON string), `order` (optional)
- **Auth**: Authenticated (page owner)

#### `updateBlock(blockId: string, formData: FormData)`
Updates a block's data, order, active state, or scheduling.
- **Input**: `data` (JSON string), `order`, `isActive`, `startAt`, `endAt`
- **Auth**: Authenticated (page owner)

#### `reorderBlocks(formData: FormData)`
Bulk updates block order positions.
- **Input**: `blocks` (JSON string — array of `{ _id, order }`)
- **Auth**: Authenticated (page owner)

#### `deleteBlock(blockId: string)`
Permanently removes a block.
- **Auth**: Authenticated (page owner)

#### `toggleBlockActive(blockId: string)`
Toggles a block's isActive state.
- **Auth**: Authenticated (page owner)

### Analytics

#### `trackClick(formData: FormData)`
Records a click on a block. Rate-limited (60/min/key).
- **Input**: `blockId`, `pageId`, `referrer` (optional)
- **Auth**: Public (no session required)

#### `trackPageView(pageId: string)`
Records a page view. Rate-limited.
- **Auth**: Public

#### `getAnalytics(pageId: string)`
Returns aggregated analytics data for a page.
- **Output**: `{ totalClicks, totalViews, clicks7d, views7d, topLinks, dailyData }`
- **Auth**: Authenticated (page owner)

### Forms

#### `submitForm(formData: FormData)`
Submits a form block. Rate-limited.
- **Input**: `blockId`, `pageId`, `data` (JSON string of field values)
- **Auth**: Public

#### `getFormSubmissions(blockId: string)`
Returns all submissions for a form block.
- **Auth**: Authenticated (page owner)

### Media

#### `uploadToCloudinary(formData: FormData)`
Uploads a file to Cloudinary.
- **Input**: `file` (File)
- **Output**: `{ url, publicId }` or `{ error }`
- **Auth**: Authenticated

## Route Handlers

### `GET /api/auth/[...nextauth]`
Auth.js catch-all route. Handles signin, signout, session fetching.

### `POST /api/auth/[...nextauth]`
Auth.js callback handler for credentials authentication.

## Public Routes

### `GET /[username]`
Server-rendered public profile page. Fetches user + page + active blocks from DB. Generates SEO metadata and QR code.

## Revalidation Strategy

- Dashboard changes revalidate `/dashboard` via `revalidatePath`
- Page title/theme/SEO changes also revalidate `/[username]`
- No ISR configured — public page is fully dynamic (always fresh)
