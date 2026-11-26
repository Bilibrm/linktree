"use client"

import { useMemo } from "react"
import type { IBlock } from "@/types"
import type { ResolvedTheme } from "@/lib/themes"
import { ThemedPage, type ItemProps } from "@/components/page/themed-page"
import { useThemeFonts } from "@/components/page/theme-fonts"
import { cn } from "@/lib/utils"

function isLive(block: IBlock, now: Date) {
  if (!block.isActive) return false
  if (block.startAt && new Date(block.startAt) > now) return false
  if (block.endAt && new Date(block.endAt) < now) return false
  return true
}

/**
 * The owner's page at phone width, drawn by the same `ThemedPage` as `/[username]`. One
 * component serves two jobs:
 *
 * - a read-only proof (no `renderBlock`): the whole page is `inert`;
 * - the editor's proof: `renderBlock` and `renderHeader` wrap each piece so the editor can
 *   add selection, drag handles and insertion points around the real rendered block.
 *
 * The owner's custom CSS is left out here; it applies on the public page only.
 */
export function PublicPreview({
  blocks,
  username,
  displayName,
  avatarUrl,
  bio,
  title,
  theme,
  showInactive,
  still = true,
  ambient = false,
  replayKey,
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
  theme: ResolvedTheme
  /** Keep hidden and out-of-schedule blocks in the list (the editor dims and labels them). */
  showInactive?: boolean
  /** No entrance, no ambient motion. The Look panel turns it off to show the theme's motion. */
  still?: boolean
  /** Ambient background motion; the app keeps it off unless the owner previews it. */
  ambient?: boolean
  /** Changing it replays the entrance (the Look panel passes the theme id). */
  replayKey?: string
  renderBlock?: (block: IBlock, index: number, content: React.ReactNode, itemProps: ItemProps) => React.ReactNode
  renderHeader?: (content: React.ReactNode) => React.ReactNode
  empty?: React.ReactNode
  gridProps?: React.HTMLAttributes<HTMLDivElement>
  className?: string
}) {
  useThemeFonts([theme.font.href])
  const visible = useMemo(() => {
    if (showInactive) return blocks
    const now = new Date()
    return blocks.filter((b) => isLive(b, now))
  }, [blocks, showInactive])
  const readOnly = !renderBlock

  return (
    <div inert={readOnly || undefined} className={cn("overflow-hidden rounded-panel border border-rule-strong", readOnly && "select-none", className)}>
      <ThemedPage
        key={replayKey}
        theme={theme}
        header={{ name: displayName || username, title, bio, avatarUrl }}
        blocks={visible}
        still={still}
        ambient={ambient}
        nameAs="p"
        renderBlock={renderBlock}
        renderHeader={renderHeader}
        empty={empty}
        listProps={gridProps}
      />
    </div>
  )
}
