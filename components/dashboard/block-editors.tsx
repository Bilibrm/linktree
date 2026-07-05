"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X, XCircle } from "lucide-react"
import { PLATFORMS, PlatformIcon } from "@/components/blocks/platform-icons"

export type EditorProps = {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
}

function PlatformSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const selected = PLATFORMS.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-small hover:bg-dashboard-bg hover:text-dashboard-text"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <PlatformIcon platform={selected.id} className="w-4 h-4" />
              <span>{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select platform</span>
          )}
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-small rounded-md transition-colors ${
                value === p.id
                  ? "bg-gold/10 text-gold"
                  : "text-dashboard-text hover:bg-dashboard-bg"
              }`}
            >
              <PlatformIcon platform={p.id} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{p.label}</span>
              {value === p.id && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function LinkEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Title</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">URL</Label>
        <Input value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">
          Social icon <span className="text-muted-foreground/50">(optional)</span>
        </Label>
        <div className="flex items-center gap-2 mb-1.5">
          {data.icon && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-dashboard-surface border border-dashboard-border">
              <PlatformIcon platform={data.icon} className="w-4 h-4" />
              <span className="text-small text-muted-foreground capitalize">{data.icon}</span>
              <button type="button" onClick={() => onChange({ ...data, icon: "" })} className="text-muted-foreground/50 hover:text-coral transition-colors ml-1">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 rounded-lg border border-dashboard-border bg-dashboard-bg/50">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ ...data, icon: data.icon === p.id ? "" : p.id })}
              title={p.label}
              className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center transition-all ${
                data.icon === p.id
                  ? "bg-gold text-ink ring-1 ring-gold"
                  : "text-muted-foreground hover:text-dashboard-text hover:bg-dashboard-surface"
              }`}
            >
              <PlatformIcon platform={p.id} className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeaderEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-small text-muted-foreground">Header text</Label>
      <Input value={data.text || ""} onChange={(e) => onChange({ ...data, text: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
    </div>
  )
}

export function TextEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-small text-muted-foreground">Content</Label>
      <Textarea value={data.content || ""} onChange={(e) => onChange({ ...data, content: e.target.value })} rows={3} className="bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20 resize-none" />
    </div>
  )
}

export function SocialEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      {(data.links || []).map((link: any, i: number) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1.5">
            <Label className="text-small text-muted-foreground">Platform {i + 1}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <PlatformSelect
                  value={link.platform}
                  onChange={(val) => { const links = [...(data.links || [])]; links[i] = { ...links[i], platform: val }; onChange({ ...data, links }) }}
                />
              </div>
              <Input value={link.url} placeholder="URL" onChange={(e) => { const links = [...(data.links || [])]; links[i] = { ...links[i], url: e.target.value }; onChange({ ...data, links }) }} className="flex-1 h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
            </div>
          </div>
          <button onClick={() => { const links = (data.links || []).filter((_: any, j: number) => j !== i); onChange({ ...data, links }) }} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-coral transition-colors mt-5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange({ ...data, links: [...(data.links || []), { platform: "", url: "" }] })} className="min-h-[44px] text-small text-gold hover:text-gold/80 transition-colors">+ Add social link</button>
    </div>
  )
}

export function ImageEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Image URL</Label>
        <Input value={data.src || ""} onChange={(e) => onChange({ ...data, src: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Caption</Label>
        <Input value={data.caption || ""} onChange={(e) => onChange({ ...data, caption: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
    </div>
  )
}

export function GalleryEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      {(data.images || []).map((img: any, i: number) => (
        <div key={i} className="space-y-1.5">
          <Label className="text-small text-muted-foreground">Image URL {i + 1}</Label>
          <Input value={img.src} onChange={(e) => { const images = [...(data.images || [])]; images[i] = { ...images[i], src: e.target.value }; onChange({ ...data, images }) }} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
        </div>
      ))}
      <button onClick={() => onChange({ ...data, images: [...(data.images || []), { src: "" }] })} className="min-h-[44px] text-small text-gold hover:text-gold/80 transition-colors">+ Add image</button>
    </div>
  )
}

export function EmbedEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-small text-muted-foreground">Embed URL</Label>
      <Input value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} placeholder="YouTube, Spotify, TikTok..." className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption font-mono focus:border-gold/50 focus:ring-gold/20" />
    </div>
  )
}

export function FormEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Form Title</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
      {(data.fields || []).map((field: any, i: number) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1.5">
            <Label className="text-small text-muted-foreground">Field {i + 1}</Label>
            <div className="flex gap-2">
              <Input value={field.label} onChange={(e) => { const fields = [...(data.fields || [])]; fields[i] = { ...fields[i], label: e.target.value }; onChange({ ...data, fields }) }} className="flex-1 h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
              <select
                value={field.type || "text"}
                onChange={(e) => { const fields = [...(data.fields || [])]; fields[i] = { ...fields[i], type: e.target.value }; onChange({ ...data, fields }) }}
                className="h-9 rounded-lg bg-dashboard-bg border border-dashboard-border text-dashboard-text text-small px-2 focus:border-gold/50 focus:ring-gold/20 outline-none"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
              </select>
            </div>
            <label className="flex items-center gap-1.5 text-small text-muted-foreground">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => { const fields = [...(data.fields || [])]; fields[i] = { ...fields[i], required: e.target.checked }; onChange({ ...data, fields }) }}
                className="rounded border-dashboard-border bg-dashboard-bg text-gold focus:ring-gold/20"
              />
              Required
            </label>
          </div>
          <button onClick={() => { const fields = (data.fields || []).filter((_: any, j: number) => j !== i); onChange({ ...data, fields }) }} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-coral transition-colors mt-6">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange({ ...data, fields: [...(data.fields || []), { label: "New Field", type: "text", required: false }] })} className="min-h-[44px] text-small text-gold hover:text-gold/80 transition-colors">+ Add field</button>
    </div>
  )
}

export function CountdownEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Title</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-small text-muted-foreground">Target Date</Label>
        <Input type="datetime-local" value={data.targetDate || ""} onChange={(e) => onChange({ ...data, targetDate: e.target.value })} className="h-9 bg-dashboard-bg border-dashboard-border text-dashboard-text text-caption focus:border-gold/50 focus:ring-gold/20" />
      </div>
    </div>
  )
}

export const editors: Record<string, React.FC<EditorProps>> = {
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
