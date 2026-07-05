"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { IBlock, BlockType } from "@/types"
import { BlockList } from "@/components/dashboard/block-list"
import { PublicPreview } from "@/components/blocks/public-preview"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createBlock } from "@/lib/actions/blocks"
import { toast } from "sonner"
import { Plus, Link2, Type, AlignLeft, Minus, Grid3X3, Image, Images, Play, ClipboardList, Timer, Smartphone, Monitor, Loader2, ArrowLeft } from "lucide-react"
import { editors } from "@/components/dashboard/block-editors"

const blockTypes: { type: BlockType; label: string; icon: typeof Link2; description: string }[] = [
  { type: "link", label: "Link", icon: Link2, description: "A clickable link button" },
  { type: "header", label: "Header", icon: Type, description: "Section heading text" },
  { type: "text", label: "Text", icon: AlignLeft, description: "Paragraph or text content" },
  { type: "divider", label: "Divider", icon: Minus, description: "Visual separator line" },
  { type: "social", label: "Social Icons", icon: Grid3X3, description: "Row of social media icons" },
  { type: "image", label: "Image", icon: Image, description: "Single image with caption" },
  { type: "gallery", label: "Gallery", icon: Images, description: "Image gallery grid" },
  { type: "embed", label: "Embed", icon: Play, description: "YouTube, Spotify, etc." },
  { type: "form", label: "Form", icon: ClipboardList, description: "Lead capture form" },
  { type: "countdown", label: "Countdown", icon: Timer, description: "Countdown timer" },
]

function getDefaultData(type: BlockType) {
  switch (type) {
    case "link":
      return { title: "New Link", url: "https://", icon: "", thumbnailUrl: "" }
    case "header":
      return { text: "New Section", level: 2 }
    case "text":
      return { content: "Add your text here...", align: "center" }
    case "divider":
      return {}
    case "social":
      return { links: [{ platform: "twitter", url: "https://" }] }
    case "image":
      return { src: "", alt: "Image", caption: "" }
    case "gallery":
      return { images: [{ src: "", alt: "" }] }
    case "embed":
      return { url: "https://", type: "youtube" }
    case "form":
      return { title: "Contact", fields: [{ label: "Name", type: "text", required: true }], buttonText: "Submit" }
    case "countdown":
      return { title: "Countdown", targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16), emoji: "🎉" }
  }
}

export function DashboardClient({
  pageId,
  username,
  initialBlocks,
  theme,
  displayName,
  avatarUrl,
  bio,
  title,
}: {
  pageId: string
  username: string
  initialBlocks: IBlock[]
  theme?: import("@/types").ThemeConfig
  displayName?: string
  avatarUrl?: string
  bio?: string
  title?: string
}) {
  const router = useRouter()
  const [blocks, setBlocks] = useState<IBlock[]>(initialBlocks)
  const [isAdding, setIsAdding] = useState(false)
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<BlockType | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})

  const handleCreateBlock = useCallback(
    async () => {
      if (!selectedType) return
      setIsAdding(true)
      const formData = new FormData()
      formData.append("pageId", pageId)
      formData.append("type", selectedType)
      formData.append("data", JSON.stringify(editData))

      const result: any = await createBlock(formData)
      if (result?.error) {
        toast.error("Failed to create block")
      } else if (result?.block) {
        setBlocks((prev) => [...prev, result.block as IBlock])
        toast.success("Block added!")
        setShowAddDialog(false)
        setSelectedType(null)
      }
      setIsAdding(false)
    },
    [pageId, selectedType, editData]
  )

  const handleSelectType = useCallback((type: BlockType) => {
    setSelectedType(type)
    setEditData(getDefaultData(type))
  }, [])

  const handleBlocksChange = useCallback((newBlocks: IBlock[]) => {
    setBlocks(newBlocks)
  }, [])

  return (
    <div className="flex h-full">
      <div className={`flex-1 overflow-y-auto ${mobileView === "preview" ? "hidden md:block" : ""}`}>
        <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="font-display text-display font-bold text-dashboard-text">Your Blocks</h1>
              <p className="text-caption text-muted-foreground mt-0.5">
                Add, edit, and reorder the blocks on your page.
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setSelectedType(null) }}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-gold text-ink hover:bg-gold/90 gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add block</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-heading text-dashboard-text">
                    {selectedType ? `Add ${blockTypes.find(bt => bt.type === selectedType)?.label || "block"}` : "Add a block"}
                  </DialogTitle>
                </DialogHeader>
                {selectedType ? (
                  <div className="space-y-4">
                    {editors[selectedType] ? (
                      (() => {
                        const Editor = editors[selectedType]
                        return <Editor data={editData} onChange={setEditData} />
                      })()
                    ) : (
                      <p className="text-caption text-muted-foreground">No editor available for this block type.</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedType(null)}
                        className="flex-1 border-dashboard-border text-muted-foreground hover:text-dashboard-text"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Back
                      </Button>
                      <Button
                        onClick={handleCreateBlock}
                        disabled={isAdding}
                        className="flex-1 bg-gold text-ink hover:bg-gold/90"
                      >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : `Add ${blockTypes.find(bt => bt.type === selectedType)?.label || "block"}`}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {blockTypes.map((bt) => {
                      const Icon = bt.icon
                      return (
                        <Button
                          key={bt.type}
                          variant="outline"
                          className="h-auto flex-col gap-2 py-4 px-3 bg-dashboard-bg border-dashboard-border text-muted-foreground hover:text-dashboard-text hover:border-gold/30 hover:bg-dashboard-surface transition-all"
                          onClick={() => handleSelectType(bt.type)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-caption font-semibold">{bt.label}</span>
                          <span className="text-small text-muted-foreground leading-tight">{bt.description}</span>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {blocks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-dashboard-border p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-dashboard-surface border border-dashboard-border mx-auto flex items-center justify-center mb-4">
                <Plus className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-display text-heading font-semibold text-dashboard-text mb-2">Your trail starts here</h3>
              <p className="text-caption text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
                Add your first block — a link, an image, a form, or anything else you want on your page.
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-gold/30 text-gold px-5 min-h-[44px] text-caption font-medium hover:bg-gold/10 transition-colors"
                onClick={() => { setShowAddDialog(true); handleSelectType("link") }}
              >
                <Link2 className="w-4 h-4" />
                Add your first link
              </button>
            </div>
          ) : (
            <BlockList
              blocks={blocks}
              pageId={pageId}
              onBlocksChange={handleBlocksChange}
            />
          )}
        </div>
      </div>

      <aside className="hidden xl:flex w-[420px] border-l border-dashboard-border bg-dashboard-bg overflow-y-auto">
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wider font-mono">Live Preview</h3>
            <a href={`/${username}`} target="_blank" className="text-small text-gold hover:underline">Open ↗</a>
          </div>
          <PublicPreview blocks={blocks} username={username} theme={theme} displayName={displayName} avatarUrl={avatarUrl} bio={bio} title={title} editable />
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-dashboard-border bg-dashboard-bg">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-3 text-center text-small font-medium transition-colors ${mobileView === "edit" ? "text-gold border-t-2 border-gold" : "text-muted-foreground"}`}
        >
          <Monitor className="w-4 h-4 mx-auto mb-0.5" />
          Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-center text-small font-medium transition-colors ${mobileView === "preview" ? "text-gold border-t-2 border-gold" : "text-muted-foreground"}`}
        >
          <Smartphone className="w-4 h-4 mx-auto mb-0.5" />
          Preview
        </button>
      </div>

      {mobileView === "preview" && (
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-20">
          <PublicPreview blocks={blocks} username={username} theme={theme} displayName={displayName} avatarUrl={avatarUrl} bio={bio} title={title} editable />
        </div>
      )}
    </div>
  )
}
