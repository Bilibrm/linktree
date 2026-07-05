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
import { Plus, Link2, Type, AlignLeft, Minus, Grid3X3, Image, Images, Play, ClipboardList, Timer, Smartphone, Monitor, Loader2, ArrowLeft, LayoutPanelTop, MousePointerClick, SquareSplitVertical, Video } from "lucide-react"
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
  { type: "button", label: "Button", icon: MousePointerClick, description: "CTA button with variants" },
  { type: "spacer", label: "Spacer", icon: SquareSplitVertical, description: "Add vertical space" },
  { type: "video", label: "Video", icon: Video, description: "Video file with poster" },
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
      return { title: "Countdown", targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16), emoji: "" }
    case "button":
      return { label: "Click me", url: "https://", variant: "primary", icon: "", fullWidth: false }
    case "spacer":
      return { height: 24 }
    case "video":
      return { src: "", poster: "", caption: "", autoplay: false, loop: false, muted: false }
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

  const blockCount = blocks.length

  return (
    <div className="flex h-full">
      <div className={`flex-1 overflow-y-auto ${mobileView === "preview" ? "hidden md:block" : ""}`}>
        <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/10 flex items-center justify-center">
                  <LayoutPanelTop className="w-4 h-4 text-gold" />
                </div>
                <h1 className="font-display text-display font-bold text-dashboard-text">Your Blocks</h1>
              </div>
              <p className="text-caption text-muted-foreground/60 mt-1 ml-[42px]">
                {blockCount > 0 ? `${blockCount} block${blockCount !== 1 ? "s" : ""} on your page` : "Add blocks to build your page"}
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setSelectedType(null) }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-gold text-ink hover:bg-gold/90 gap-1.5 px-4 py-2.5 h-auto shadow-sm shadow-gold/20 transition-all hover:shadow-gold/30 hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Add block</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-heading text-dashboard-text">
                    {selectedType ? `Add ${blockTypes.find(bt => bt.type === selectedType)?.label || "block"}` : "Add a block"}
                  </DialogTitle>
                  {!selectedType && (
                    <p className="text-small text-muted-foreground/60 mt-1">Choose a block type to add to your page.</p>
                  )}
                </DialogHeader>
                {selectedType ? (
                  <div className="space-y-5">
                    {editors[selectedType] ? (
                      (() => {
                        const Editor = editors[selectedType]
                        return <Editor data={editData} onChange={setEditData} />
                      })()
                    ) : (
                      <p className="text-caption text-muted-foreground">No editor available for this block type.</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedType(null)}
                        className="flex-1 border-dashboard-border/60 text-muted-foreground hover:text-dashboard-text"
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
                  <div className="grid grid-cols-2 gap-2.5">
                    {blockTypes.map((bt) => {
                      const Icon = bt.icon
                      return (
                        <Button
                          key={bt.type}
                          variant="outline"
                          className="h-auto flex-col gap-2 py-4 px-3 bg-dashboard-bg/50 border-dashboard-border/50 text-muted-foreground hover:text-dashboard-text hover:border-gold/20 hover:bg-gold/[0.02] transition-all group/bt"
                          onClick={() => handleSelectType(bt.type)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold/[0.07] to-gold/[0.02] border border-gold/[0.08] flex items-center justify-center group-hover/bt:border-gold/20 group-hover/bt:shadow-sm transition-all">
                            <Icon className="w-4 h-4 text-gold/80 group-hover/bt:text-gold transition-colors" />
                          </div>
                          <span className="text-small font-semibold text-dashboard-text/80 group-hover/bt:text-dashboard-text transition-colors">{bt.label}</span>
                          <span className="text-small text-muted-foreground/50 group-hover/bt:text-muted-foreground/70 leading-tight transition-colors">{bt.description}</span>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {blocks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-dashboard-border/40 p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/[0.08] to-gold/[0.02] border border-gold/[0.08] mx-auto flex items-center justify-center mb-5 shadow-sm">
                <LayoutPanelTop className="w-6 h-6 text-gold/70" />
              </div>
              <h3 className="font-display text-[20px] font-semibold text-dashboard-text mb-2 tracking-tight">Your page is ready</h3>
              <p className="text-caption text-muted-foreground/60 max-w-xs mx-auto mb-8 leading-relaxed">
                Add your first block — a link, an image, a form, or anything else you want on your page.
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-gold/20 text-gold/90 px-5 min-h-[44px] text-small font-medium hover:bg-gold/[0.06] hover:border-gold/30 transition-all shadow-sm"
                onClick={() => { setShowAddDialog(true); handleSelectType("link") }}
              >
                <Plus className="w-4 h-4" />
                Add your first block
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

      <aside className="hidden xl:flex w-[420px] border-l border-dashboard-border/50 bg-dashboard-bg/80 overflow-y-auto backdrop-blur-sm">
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gold/[0.08] border border-gold/[0.12] flex items-center justify-center">
                <Smartphone className="w-3 h-3 text-gold/70" />
              </div>
              <h3 className="text-small font-medium text-muted-foreground/80 tracking-wide">Live Preview</h3>
            </div>
            <a href={`/${username}`} target="_blank" className="text-small text-gold/70 hover:text-gold hover:underline underline-offset-2 transition-colors">Open ↗</a>
          </div>
          <PublicPreview blocks={blocks} username={username} theme={theme} displayName={displayName} avatarUrl={avatarUrl} bio={bio} title={title} editable />
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-dashboard-border/50 bg-dashboard-bg/90 backdrop-blur-lg" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-3 text-center text-small font-medium transition-colors ${mobileView === "edit" ? "text-gold" : "text-muted-foreground/50"}`}
        >
          <Monitor className={`w-4 h-4 mx-auto mb-0.5 ${mobileView === "edit" ? "text-gold" : "text-muted-foreground/40"}`} />
          Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-center text-small font-medium transition-colors ${mobileView === "preview" ? "text-gold" : "text-muted-foreground/50"}`}
        >
          <Smartphone className={`w-4 h-4 mx-auto mb-0.5 ${mobileView === "preview" ? "text-gold" : "text-muted-foreground/40"}`} />
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
