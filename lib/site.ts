/** Public host shown wherever a page URL is previewed (landing, auth, dashboard). */
export const SITE_HOST = "linknest-dz.vercel.app"

/** Origin the app is served from. Local and preview builds set NEXT_PUBLIC_BASE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || `https://${SITE_HOST}`).replace(/\/$/, "")

/** The address people read: `linknest-dz.vercel.app/amina`. */
export function pageAddress(username: string): string {
  return `${SITE_HOST}/${username}`
}

/** The address that opens the page in this environment. */
export function pageUrl(username: string): string {
  return `${SITE_URL}/${username}`
}

export const GITHUB_URL = "https://github.com/Bilibrm/linktree"

/**
 * Turn whatever someone types into the closest allowed username while they type:
 * lowercase, only the characters `usernameSchema` accepts, max 30.
 * Leading/trailing `-` and `_` are left for the schema to report, so typing "my-" is kept.
 */
export function normalizeUsername(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30)
}
