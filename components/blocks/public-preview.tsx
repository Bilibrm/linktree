import type { IBlock } from "@/types"
import { BlockRenderer } from "./block-renderer"

export function PublicPreview({
  blocks,
  username,
  editable,
}: {
  blocks: IBlock[]
  username: string
  editable?: boolean
}) {
  const visibleBlocks = blocks.filter((b) => {
    if (!b.isActive) return false
    const now = new Date()
    if (b.startAt && new Date(b.startAt) > now) return false
    if (b.endAt && new Date(b.endAt) < now) return false
    return true
  })

  return (
    <div className="mx-auto max-w-sm w-full">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold mb-3">
          {username.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-lg font-semibold">@{username}</h1>
      </div>

      <div className="space-y-3">
        {visibleBlocks.map((block) => (
          <div key={block._id} className={editable ? "pointer-events-none" : ""}>
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <a href="/" className="hover:underline">
          LinkNest
        </a>
      </div>
    </div>
  )
}
