import type { BlockComponentProps } from "./block-props"

const ALIGN = new Set(["left", "center", "right"])

export function TextBlock({ data }: BlockComponentProps) {
  if (!data.content) return null
  const align = ALIGN.has(data.align as string) ? (data.align as React.CSSProperties["textAlign"]) : undefined
  return (
    <p className="lp-text" style={align ? { textAlign: align } : undefined}>
      {data.content}
    </p>
  )
}
