"use client"

import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { IBlock } from "@/types"
import { Switch } from "@/components/ui/switch"
import { updateBlock, deleteBlock, toggleBlockActive } from "@/lib/actions/blocks"
import { toast } from "sonner"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { GripVertical, Pencil, Trash2, Check, X, Link2, Type, Minus, Grid3X3, Image, Images, Play, ClipboardList, Timer, AlignLeft } from "lucide-react"
import { editors } from "@/components/dashboard/block-editors"

const typeLabels: Record<string, string> = {
  link: "Link",
  header: "Header",
  text: "Text",
  divider: "Divider",
  social: "Social Icons",
  image: "Image",
  gallery: "Gallery",
  embed: "Embed",
  form: "Form",
  countdown: "Countdown",
}

const typeIcons: Record<string, typeof Link2> = {
  link: Link2,
  header: Type,
  text: AlignLeft,
  divider: Minus,
  social: Grid3X3,
  image: Image,
  gallery: Images,
  embed: Play,
  form: ClipboardList,
  countdown: Timer,
}

export function SortableBlock({ block, pageId, onBlockUpdate, onBlockDelete }: { block: IBlock; pageId: string; onBlockUpdate?: (block: IBlock) => void; onBlockDelete?: (blockId: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(block.data as Record<string, any>)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const TypeIcon = typeIcons[block.type] || Link2

  async function handleSave() {
    setIsSaving(true)
    const formData = new FormData()
    formData.append("data", JSON.stringify(editData))

    const result: any = await updateBlock(block._id, formData)
    if (result?.error) {
      toast.error("Failed to save")
    } else {
      toast.success("Saved!")
      setIsEditing(false)
      onBlockUpdate?.({ ...block, data: editData })
    }
    setIsSaving(false)
  }

  async function handleToggleActive() {
    const result = await toggleBlockActive(block._id)
    if (result.success) {
      toast.success(result.isActive ? "Block enabled" : "Block disabled")
      onBlockUpdate?.({ ...block, isActive: result.isActive })
    }
  }

  async function handleDelete() {
    const result = await deleteBlock(block._id)
    if (result.success) {
      toast.success("Block deleted")
      onBlockDelete?.(block._id)
      setShowDeleteConfirm(false)
    }
  }

  const Editor = editors[block.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border transition-all duration-200 ${
        isDragging ? "border-gold/30 shadow-lg shadow-gold/5 z-50" : "border-dashboard-border hover:border-dashboard-border"
      } ${!block.isActive ? "opacity-50" : ""} bg-dashboard-surface/50`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-gold transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Type icon + label */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-dashboard-bg border border-dashboard-border flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="min-w-0">
            <span className="text-caption font-medium text-dashboard-text block truncate">
              {block.type === "link" && (editData.title || block.data.link?.title || "Untitled link")}
              {block.type === "header" && (editData.text || block.data.header?.text || "Untitled header")}
              {block.type === "text" && (editData.content || block.data.text?.content || "Text block")}
              {block.type === "social" && "Social icons"}
              {block.type === "image" && "Image"}
              {block.type === "gallery" && "Gallery"}
              {block.type === "embed" && "Embed"}
              {block.type === "form" && (editData.title || block.data.form?.title || "Form")}
              {block.type === "countdown" && (editData.title || block.data.countdown?.title || "Countdown")}
              {block.type === "divider" && "Divider"}
            </span>
            <span className="text-small text-muted-foreground/50 block">{typeLabels[block.type]}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Switch checked={block.isActive} onCheckedChange={handleToggleActive} />
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => { setEditData(block.data as Record<string, any>); setIsEditing(false) }}
                className="min-h-[44px] px-3 py-2 rounded-lg text-muted-foreground hover:text-dashboard-text hover:bg-white/5 text-small flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="min-h-[44px] px-3 py-2 rounded-lg bg-gold text-ink text-small font-medium flex items-center gap-1.5 hover:bg-gold/90 transition-colors disabled:opacity-50">
                <Check className="w-3.5 h-3.5" />
                {isSaving ? "..." : "Save"}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="min-h-[44px] px-3 py-2 rounded-lg text-muted-foreground hover:text-dashboard-text hover:bg-white/5 text-small flex items-center gap-1.5 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          <button onClick={() => setShowDeleteConfirm(true)} className="min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-coral hover:bg-coral/10 flex items-center justify-center transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block preview when not editing */}
      {!isEditing && (
        <div className="px-4 pb-3 pointer-events-none opacity-70">
          <div className="rounded-lg bg-dashboard-bg/50 border border-dashboard-border p-3 scale-[0.97] origin-left">
            <BlockRenderer block={block} />
          </div>
        </div>
      )}

      {/* Editor */}
      {isEditing && Editor && (
        <div className="px-4 pb-4 pt-1 border-t border-dashboard-border">
          <Editor data={editData} onChange={setEditData} />
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete block"
        description="Are you sure you want to delete this block? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
