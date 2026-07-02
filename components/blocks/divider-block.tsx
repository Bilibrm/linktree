import type { BlockComponentProps } from "./block-renderer"
import { getAccentColor } from "@/lib/theme-utils"

export function DividerBlock({ theme }: BlockComponentProps) {
  return (
    <hr
      className="my-2 border-t"
      style={{ borderColor: getAccentColor(theme), opacity: 0.15 }}
    />
  )
}
