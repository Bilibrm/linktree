"use client"

import { trackClick } from "@/lib/actions/analytics"

export function LinkBlock({ data, blockId, pageId }: { data: any; blockId?: string; pageId?: string }) {
  async function handleClick() {
    if (!blockId || !pageId) return
    const formData = new FormData()
    formData.append("blockId", blockId)
    formData.append("pageId", pageId)
    formData.append("referrer", document.referrer)
    await trackClick(formData)
  }

  return (
    <a
      href={data.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center justify-between w-full rounded-xl border bg-card px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-all hover:shadow-sm"
    >
      <span className="flex items-center gap-3">
        {data.thumbnailUrl && (
          <img src={data.thumbnailUrl} alt="" className="w-6 h-6 rounded object-cover" />
        )}
        <span>{data.title || "Untitled Link"}</span>
      </span>
      <span className="text-muted-foreground">↗</span>
    </a>
  )
}
