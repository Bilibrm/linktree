import Link from "next/link"
import type { IBlock } from "@/types"
import { nameFitLength, themeRootProps, type ResolvedTheme } from "@/lib/themes"
import { BlockRenderer, blockIsHalf } from "@/components/blocks/block-renderer"
import { cn } from "@/lib/utils"
import { AmbientPause } from "./ambient"

export type PageHeader = {
  name: string
  title?: string
  bio?: string
  avatarUrl?: string
}

export type ThemedPageProps = {
  theme: ResolvedTheme
  header: PageHeader
  blocks: IBlock[]
  /** The public page fills the window; proofs size to their content. */
  page?: boolean
  /** No entrance and no ambient motion: the editor proof, picker proofs. */
  still?: boolean
  /** Ambient background motion. Off in the app (§6.2) unless the owner asks to preview it. */
  ambient?: boolean
  /** Tag of the owner's name. The public page's h1; a proof inside the dashboard is not. */
  nameAs?: "h1" | "p"
  /** Wrap one block (the editor adds selection and drag). `itemProps` go on the grid item. */
  renderBlock?: (block: IBlock, index: number, content: React.ReactNode, itemProps: ItemProps) => React.ReactNode
  /** Wrap the avatar, name and bio. */
  renderHeader?: (content: React.ReactNode) => React.ReactNode
  /** Shown in place of the blocks when there are none. */
  empty?: React.ReactNode
  /** Extra attributes for the block list (the editor's listbox role). */
  listProps?: React.HTMLAttributes<HTMLDivElement>
  /** Shown under the blocks. The public page passes the "Made with LinkNest" link. */
  footer?: React.ReactNode
  /** Mark pieces for the landing hero's compose timeline. */
  composeItems?: boolean
  /** Only the blocks, no header or background (the landing's block catalog). */
  bare?: boolean
  className?: string
  style?: React.CSSProperties
}

export type ItemProps = { className: string; style: React.CSSProperties }

/**
 * An owner's page drawn in their theme (DESIGN_SYSTEM.md §8.8, §8.9). Directive-free and
 * hook-free, so it renders on the server for `/[username]` and inside client components
 * for the editor proof, the Look panel and the landing page. Every theme layer is CSS in
 * app/themes.css, keyed off the attributes `themeRootProps` puts on the root.
 */
export function ThemedPage({
  theme,
  header,
  blocks,
  page,
  still,
  ambient = true,
  nameAs = "h1",
  renderBlock,
  renderHeader,
  empty,
  listProps,
  footer,
  composeItems,
  bare,
  className,
  style,
}: ThemedPageProps) {
  const root = themeRootProps(theme)
  const NameTag = nameAs
  const Main = page ? "main" : "div"
  const compose = composeItems ? { "data-compose-item": "" } : {}
  const initial = header.name.trim().charAt(0) || "?"

  const head = (
    <div className="lp-head" style={{ "--i": 0 } as React.CSSProperties} {...compose}>
      <div className="lp-avatar" aria-hidden={header.avatarUrl ? undefined : true}>
        {header.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- owner-supplied avatar from any host
          <img src={header.avatarUrl} alt={header.name} width={128} height={128} decoding="async" />
        ) : (
          initial
        )}
      </div>
      <div className="lp-id">
        <NameTag className="lp-name">{header.name}</NameTag>
        {header.title && header.title !== header.name && <p className="lp-tagline">{header.title}</p>}
        {header.bio && <p className="lp-bio">{header.bio}</p>}
      </div>
    </div>
  )

  const items = blocks.map((block, index) => {
    const itemProps: ItemProps = {
      className: cn("lp-item", blockIsHalf(block) ? "lp-half" : "lp-full"),
      style: { "--i": Math.min(index + 1, 14) } as React.CSSProperties,
    }
    const content = <BlockRenderer block={block} />
    if (renderBlock) return renderBlock(block, index, content, itemProps)
    return (
      <li key={block._id} {...itemProps} {...compose}>
        {content}
      </li>
    )
  })

  if (bare) {
    return (
      <div {...root.attrs} data-still="" className={cn("lp lp-bare", className)} style={{ ...root.style, ...style } as React.CSSProperties}>
        <ul className="lp-blocks" role="list">
          {items}
        </ul>
      </div>
    )
  }

  return (
    <div
      {...root.attrs}
      data-still={still ? "" : undefined}
      data-ambient={ambient ? undefined : "off"}
      className={cn("lp", page && "lp-page", className)}
      style={{ ...root.style, "--lp-name-len": String(nameFitLength(header.name)), ...style } as React.CSSProperties}
    >
      <div className="lp-bg" aria-hidden="true">
        <span className="lp-art lp-art-a" />
        <span className="lp-art lp-art-b" />
      </div>
      <div className="lp-cover" aria-hidden="true" />
      {!still && ambient && (theme.background.kind === "drift" || theme.background.kind === "blobs") && <AmbientPause />}
      <div className="lp-frame">
        <header className="lp-side">{renderHeader ? renderHeader(head) : head}</header>
        <Main className="lp-main">
          {blocks.length > 0 ? (
            renderBlock ? (
              <div {...listProps} className={cn("lp-blocks", listProps?.className)}>
                {items}
              </div>
            ) : (
              <ul className="lp-blocks" role="list">
                {items}
              </ul>
            )
          ) : (
            (empty ?? <p className="lp-empty">This page is still being set up.</p>)
          )}
          {footer}
        </Main>
      </div>
    </div>
  )
}

/** The small credit under every public page (§8.8). */
export function MadeWithLinkNest() {
  return (
    <footer className="lp-foot">
      <Link href="/" prefetch={false}>
        Made with LinkNest
      </Link>
    </footer>
  )
}
