"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { IBlock } from "@/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { updateBlock, deleteBlock, toggleBlockActive } from "@/lib/actions/blocks"
import { toast } from "sonner"
import { BlockRenderer } from "@/components/blocks/block-renderer"
import { GripVertical, Pencil, Trash2, Check, X, Link2, Type, Minus, Grid3X3, Image, Images, Play, ClipboardList, Timer, AlignLeft } from "lucide-react"

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

type EditorProps = {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
}

function LinkEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Title</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">URL</Label>
        <Input value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
      </div>
    </div>
  )
}

function HeaderEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-small text-muted-foreground">Header text</Label>
      <Input value={data.text || ""} onChange={(e) => onChange({ ...data, text: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
    </div>
  )
}

function TextEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-small text-muted-foreground">Content</Label>
      <Textarea value={data.content || ""} onChange={(e) => onChange({ ...data, content: e.target.value })} rows={3} className="bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20 resize-none" />
    </div>
  )
}

function SocialEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      {(data.links || []).map((link: any, i: number) => (
        <div key={i} className="flex gap-2">
          <Input value={link.platform} placeholder="Platform" onChange={(e) => { const links = [...(data.links || [])]; links[i] = { ...links[i], platform: e.target.value }; onChange({ ...data, links }) }} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
          <Input value={link.url} placeholder="URL" onChange={(e) => { const links = [...(data.links || [])]; links[i] = { ...links[i], url: e.target.value }; onChange({ ...data, links }) }} className="h-9 bg-ink border-white/5 text-bone text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
        </div>
      ))}
      <button onClick={() => onChange({ ...data, links: [...(data.links || []), { platform: "", url: "" }] })} className="text-small text-gold hover:text-gold/80 transition-colors">+ Add social link</button>
    </div>
  )
}

function ImageEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Image URL</Label>
        <Input value={data.src || ""} onChange={(e) => onChange({ ...data, src: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Caption</Label>
        <Input value={data.caption || ""} onChange={(e) => onChange({ ...data, caption: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
    </div>
  )
}

function GalleryEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      {(data.images || []).map((img: any, i: number) => (
        <div key={i} className="space-y-1.5">
          <Label className="text-small text-muted-foreground">Image URL {i + 1}</Label>
          <Input value={img.src} onChange={(e) => { const images = [...(data.images || [])]; images[i] = { ...images[i], src: e.target.value }; onChange({ ...data, images }) }} className="h-9 bg-ink border-white/5 text-bone text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
        </div>
      ))}
      <button onClick={() => onChange({ ...data, images: [...(data.images || []), { src: "" }] })} className="text-small text-gold hover:text-gold/80 transition-colors">+ Add image</button>
    </div>
  )
}

function EmbedEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-small text-muted-foreground">Embed URL</Label>
      <Input value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} placeholder="YouTube, Spotify, TikTok..." className="h-9 bg-ink border-white/5 text-bone text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
    </div>
  )
}

function FormEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Form Title</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
      {(data.fields || []).map((field: any, i: number) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-small text-muted-foreground">Field {i + 1}</Label>
            <Input value={field.label} onChange={(e) => { const fields = [...(data.fields || [])]; fields[i] = { ...fields[i], label: e.target.value }; onChange({ ...data, fields }) }} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
          </div>
          <button onClick={() => { const fields = (data.fields || []).filter((_: any, j: number) => j !== i); onChange({ ...data, fields }) }} className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-coral transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange({ ...data, fields: [...(data.fields || []), { label: "New Field", type: "text", required: false }] })} className="text-small text-gold hover:text-gold/80 transition-colors">+ Add field</button>
    </div>
  )
}

function CountdownEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Title</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Target Date</Label>
        <Input type="datetime-local" value={data.targetDate || ""} onChange={(e) => onChange({ ...data, targetDate: e.target.value })} className="h-9 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
    </div>
  )
}

const editors: Record<string, React.FC<EditorProps>> = {
  link: LinkEditor,
  header: HeaderEditor,
  text: TextEditor,
  social: SocialEditor,
  image: ImageEditor,
  gallery: GalleryEditor,
  embed: EmbedEditor,
  form: FormEditor,
  countdown: CountdownEditor,
}

export function SortableBlock({ block, pageId, onBlockUpdate, onBlockDelete }: { block: IBlock; pageId: string; onBlockUpdate?: (block: IBlock) => void; onBlockDelete?: (blockId: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(block.data as Record<string, any>)
  const [isSaving, setIsSaving] = useState(false)

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
    }
  }

  const Editor = editors[block.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border transition-all duration-200 ${
        isDragging ? "border-gold/30 shadow-lg shadow-gold/5 z-50" : "border-white/5 hover:border-white/10"
      } ${!block.isActive ? "opacity-50" : ""} bg-surface/50`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-gold transition-colors touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Type icon + label */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-ink border border-white/5 flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-3.5 h-3.5 text-gold" />
          </div>
          <div className="min-w-0">
            <span className="text-caption font-medium text-bone block truncate">
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
          <Switch checked={block.isActive} onCheckedChange={handleToggleActive} className="scale-75" />
          {isEditing ? (
            <button onClick={handleSave} disabled={isSaving} className="h-7 px-2.5 rounded-lg bg-gold text-ink text-small font-medium flex items-center gap-1 hover:bg-gold/90 transition-colors disabled:opacity-50">
              <Check className="w-3 h-3" />
              {isSaving ? "..." : "Save"}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="h-7 px-2.5 rounded-lg text-muted-foreground hover:text-bone hover:bg-white/5 text-small flex items-center gap-1 transition-colors">
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          )}
          <button onClick={handleDelete} className="h-7 w-7 rounded-lg text-muted-foreground hover:text-coral hover:bg-coral/10 flex items-center justify-center transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block preview when not editing */}
      {!isEditing && (
        <div className="px-4 pb-3 pointer-events-none opacity-70">
          <div className="rounded-lg bg-ink/50 border border-white/3 p-3 scale-[0.97] origin-left">
            <BlockRenderer block={block} />
          </div>
        </div>
      )}

      {/* Editor */}
      {isEditing && Editor && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          <Editor data={editData} onChange={setEditData} />
        </div>
      )}
    </div>
  )
}
