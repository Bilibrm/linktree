import { useMemo } from "react"
import type { IBlock, ThemeConfig } from "@/types"
import { BlockRenderer } from "./block-renderer"
import { getAvatarRadius, getLayoutMaxWidth, getSpacingGap, getBlockSpanClass, themeToCSSVars, getBackgroundStyle } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"

/**
 * The owner's page at phone width, drawn with the same `BlockRenderer` and theme helpers
 * as `/[username]`. One component serves two jobs:
 *
 * - a read-only preview (`editable` without the render props): the whole page is `inert`;
 * - the editor's proof: `renderBlock` and `renderHeader` wrap each piece so the editor can
 *   add selection, drag handles and insertion points around the real rendered block.
 */
export function PublicPreview({
  blocks,
  username,
  displayName,
  avatarUrl,
  bio,
  title,
  theme,
  editable,
  showInactive,
  renderBlock,
  renderHeader,
  empty,
  gridProps,
  className,
}: {
  blocks: IBlock[]
  username: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  title?: string
  theme?: ThemeConfig
  editable?: boolean
  /** Keep hidden and out-of-schedule blocks in the list (the editor dims and labels them). */
  showInactive?: boolean
  /** Wrap one block. `content` is the rendered block, `spanClass` its grid span. */
  renderBlock?: (block: IBlock, index: number, content: React.ReactNode, spanClass: string) => React.ReactNode
  /** Wrap the avatar, name and bio. */
  renderHeader?: (content: React.ReactNode) => React.ReactNode
  /** Shown in place of the blocks when there are none. */
  empty?: React.ReactNode
  gridProps?: React.HTMLAttributes<HTMLDivElement>
  className?: string
}) {
  const visibleBlocks = useMemo(
    () =>
      showInactive
        ? blocks
        : blocks.filter((b) => {
            if (!b.isActive) return false
            const now = new Date()
            if (b.startAt && new Date(b.startAt) > now) return false
            if (b.endAt && new Date(b.endAt) < now) return false
            return true
          }),
    [blocks, showInactive]
  )

  const t: ThemeConfig = useMemo(() => theme || { preset: "minimal" }, [theme])
  const name = displayName || username
  const cssVars = useMemo(() => themeToCSSVars(t), [t])
  const bgStyle = useMemo(() => getBackgroundStyle(t), [t])
  const avatarRadius = getAvatarRadius(t)
  const maxWidth = getLayoutMaxWidth(t)
  const gap = getSpacingGap(t)
  const wholePageInert = editable && !renderBlock

  const header = (
    <div className="flex flex-col items-center text-center">
      <div className={`p-[3px] avatar-ring ${avatarRadius}`}>
        <div
          className={`flex size-[94px] items-center justify-center overflow-hidden text-3xl font-bold ${avatarRadius}`}
          style={{ backgroundColor: avatarUrl ? "transparent" : "var(--page-accent)", color: "var(--page-button-text)" }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- owner-supplied avatar URL; its host is not guaranteed to be in next.config remotePatterns
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
      </div>
      <p className="mt-5 text-xl leading-tight font-bold tracking-tight" style={{ color: "var(--page-accent)" }}>
        {name}
      </p>
      {title && title !== name && (
        <p className="mt-1.5 text-sm leading-snug" style={{ color: "var(--page-accent)", opacity: 0.65 }}>
          {title}
        </p>
      )}
      {bio && (
        <p className="mt-3 max-w-[260px] text-sm leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.5 }}>
          {bio}
        </p>
      )}
    </div>
  )

  return (
    <div
      inert={wholePageInert || undefined}
      className={cn("overflow-hidden rounded-panel border border-rule-strong", wholePageInert && "select-none", className)}
    >
      <div className="flex flex-col items-center px-5 pt-10 pb-6" style={{ ...bgStyle, ...cssVars, fontFamily: "var(--page-font-family)" }}>
        <div className={`mx-auto flex w-full flex-col items-center ${maxWidth}`}>
          {renderHeader ? renderHeader(header) : header}

          {visibleBlocks.length > 0 && (
            <div {...gridProps} className={cn(`mt-8 grid w-full grid-cols-2 ${gap}`, gridProps?.className)}>
              {visibleBlocks.map((block, i) => {
                const spanClass = getBlockSpanClass(block.type, block.data)
                const content = <BlockRenderer block={block} theme={t} index={i} />
                return renderBlock ? (
                  renderBlock(block, i, content, spanClass)
                ) : (
                  <div key={block._id} className={spanClass}>
                    {content}
                  </div>
                )
              })}
            </div>
          )}

          {visibleBlocks.length === 0 &&
            (empty ?? (
              <p className="mt-8 text-center text-sm leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.5 }}>
                This page is still being set up.
              </p>
            ))}

          <p className="mt-8 text-center text-xs" style={{ color: "var(--page-accent)", opacity: 0.3 }}>
            LinkNest
          </p>
        </div>
      </div>
    </div>
  )
}
