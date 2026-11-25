import type { BlockComponentProps } from "./block-props"

/** The owner's name is the page's h1, so header blocks start at h2. */
const TAGS = { 1: "h2", 2: "h3", 3: "h4" } as const

export function HeaderBlock({ data }: BlockComponentProps) {
  const level = data.level === 1 || data.level === 3 ? data.level : 2
  const Tag = TAGS[level]
  return <Tag className={`lp-heading lp-h${level}`}>{data.text || "Header"}</Tag>
}
