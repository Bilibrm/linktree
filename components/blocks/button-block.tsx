import { safeHref, trackAttrs, type BlockComponentProps } from "./block-props"
import { PlatformIcon } from "./platform-icons"

const VARIANTS = new Set(["primary", "outline", "ghost"])

export function ButtonBlock({ data, blockId, pageId }: BlockComponentProps) {
  const variant = VARIANTS.has(data.variant as string) ? (data.variant as string) : "primary"
  return (
    <a
      href={safeHref(data.url) ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="lp-btn"
      data-variant={variant}
      data-width={data.fullWidth ? "full" : "auto"}
      {...trackAttrs(blockId, pageId)}
    >
      {data.icon && <PlatformIcon platform={data.icon} className="size-[18px]" />}
      <span>{data.label || "Button"}</span>
    </a>
  )
}
