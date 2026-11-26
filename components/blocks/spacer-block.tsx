import type { BlockComponentProps } from "./block-props"

export function SpacerBlock({ data }: BlockComponentProps) {
  const height = Math.min(Math.max(Number(data.height) || 24, 4), 240)
  return <div aria-hidden="true" style={{ height }} />
}
