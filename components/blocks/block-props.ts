import type { FlatBlockData } from "@/lib/validation"

export type BlockComponentProps = {
  data: FlatBlockData
  blockId?: string
  /** Empty on samples (landing, picker proofs): nothing is tracked or submitted. */
  pageId?: string
}

/** The attribute a tile carries so the page beacon can count its taps. */
export function trackAttrs(blockId?: string, pageId?: string): Record<string, string> {
  return blockId && pageId ? { "data-track": blockId } : {}
}

/** An owner link that is safe in `href`: http(s), mailto or tel. Anything else is dropped. */
export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  if (!v) return null
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v
  // The old editor accepted a bare domain ("example.com/shop"); read it as https.
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${v}`
  return null
}
