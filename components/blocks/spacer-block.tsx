import type { BlockComponentProps } from "./block-renderer"

export function SpacerBlock({ data }: BlockComponentProps) {
  const height = data.height || 24
  return <div aria-hidden="true" style={{ height }} />
}
