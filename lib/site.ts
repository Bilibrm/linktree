/** Public host shown wherever a page URL is previewed (landing, auth, dashboard). */
export const SITE_HOST = "linknest-dz.vercel.app"

export const GITHUB_URL = "https://github.com/Bilibrm/linktree"

/**
 * Turn whatever someone types into the closest allowed username while they type:
 * lowercase, only the characters `usernameSchema` accepts, max 30.
 * Leading/trailing `-` and `_` are left for the schema to report, so typing "my-" isn't eaten.
 */
export function normalizeUsername(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30)
}
