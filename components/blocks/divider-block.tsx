import type { BlockComponentProps } from "./block-renderer"
import { getEntranceAnimClass } from "@/lib/theme-utils"

export function DividerBlock({ theme }: BlockComponentProps) {
  return (
    <hr
      className={`my-2 border-t ${getEntranceAnimClass(theme)}`}
      style={{ borderColor: "var(--page-accent)", opacity: 0.15 }}
    />
  )
}
