"use client"

import { useId, useState } from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PLATFORMS, PlatformIcon } from "@/components/blocks/platform-icons"
import type { FlatBlockData } from "@/lib/validation"
import { cn } from "@/lib/utils"

export type EditorProps = {
  data: FlatBlockData
  onChange: (data: FlatBlockData) => void
}

/* Inspector field pieces. 44px tall on touch, 36px from 768px up. */
const control = "h-11 md:h-9"
const selectClass = cn(
  control,
  "w-full rounded-label border border-input bg-sheet px-2.5 text-base text-ink transition-colors hover:border-ink md:text-sm"
)
const removeButton =
  "flex size-11 shrink-0 items-center justify-center rounded-label text-ink-soft transition-colors duration-150 hover:bg-tint hover:text-danger-ink md:size-9"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="type-small text-ink">
        {label}
        {hint && <span className="font-normal text-ink-soft">{hint}</span>}
      </Label>
      {children(id)}
    </div>
  )
}

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <div>
        <Label htmlFor={id} className="type-small text-ink">
          {label}
        </Label>
        {description && <p className="type-small font-normal text-ink-soft">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function AddRowButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className={cn(control, "w-full")}>
      <Plus aria-hidden="true" />
      {children}
    </Button>
  )
}

function PlatformSelect({ value, onChange, label }: { value: string; onChange: (val: string) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const selected = PLATFORMS.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={label}
          className={cn(control, "w-full justify-between bg-sheet px-2.5 font-normal")}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <PlatformIcon platform={selected.id} className="size-4 shrink-0" />
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="text-ink-soft">Choose a platform</span>
          )}
          <ChevronsUpDown className="size-3.5 shrink-0 text-ink-soft" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="max-h-[280px] overflow-y-auto p-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange(p.id)
                setOpen(false)
              }}
              className={cn(
                "flex min-h-11 w-full items-center gap-2.5 rounded-label px-3 text-sm transition-colors md:min-h-9",
                value === p.id ? "bg-tint font-semibold text-ink" : "text-ink hover:bg-tint"
              )}
            >
              <PlatformIcon platform={p.id} className="size-4 shrink-0" />
              <span className="flex-1 text-left">{p.label}</span>
              {value === p.id && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Optional platform glyph for a link or button. The chosen one is filled and checked. */
function IconPicker({ value, onChange }: { value?: string; onChange: (val: string) => void }) {
  const chosen = PLATFORMS.find((p) => p.id === value)
  return (
    <fieldset className="space-y-1.5">
      <legend className="type-small text-ink">
        Icon <span className="font-normal text-ink-soft">(optional{chosen ? `, ${chosen.label}` : ""})</span>
      </legend>
      <div className="flex max-h-36 flex-wrap gap-1 overflow-y-auto rounded-label border border-rule p-1">
        {PLATFORMS.map((p) => {
          const on = value === p.id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              aria-label={p.label}
              title={p.label}
              onClick={() => onChange(on ? "" : p.id)}
              className={cn(
                "relative flex size-11 items-center justify-center rounded-label transition-colors duration-150 md:size-9",
                on ? "bg-ink text-paper" : "text-ink-soft hover:bg-tint hover:text-ink"
              )}
            >
              <PlatformIcon platform={p.id} className="size-4" />
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function LinkEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Field label="Title">
        {(id) => <Input id={id} className={control} value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} />}
      </Field>
      <Field label="Web address">
        {(id) => (
          <Input id={id} className={control} type="url" inputMode="url" placeholder="https://" value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} />
        )}
      </Field>
      <IconPicker value={data.icon} onChange={(icon) => onChange({ ...data, icon })} />
      <SwitchRow
        label="Featured"
        description="Full width and filled, above the rest."
        checked={!!data.featured}
        onCheckedChange={(featured) => onChange({ ...data, featured })}
      />
    </div>
  )
}

export function HeaderEditor({ data, onChange }: EditorProps) {
  return (
    <Field label="Heading">
      {(id) => <Input id={id} className={control} value={data.text || ""} onChange={(e) => onChange({ ...data, text: e.target.value })} />}
    </Field>
  )
}

export function TextEditor({ data, onChange }: EditorProps) {
  return (
    <Field label="Text">
      {(id) => <Textarea id={id} rows={5} className="resize-y" value={data.content || ""} onChange={(e) => onChange({ ...data, content: e.target.value })} />}
    </Field>
  )
}

export function SocialEditor({ data, onChange }: EditorProps) {
  const links = data.links || []
  const update = (i: number, patch: Partial<{ platform: string; url: string }>) =>
    onChange({ ...data, links: links.map((link, j) => (j === i ? { ...link, ...patch } : link)) })

  return (
    <div className="space-y-4">
      {links.map((link, i) => (
        <fieldset key={i} className="space-y-1.5">
          <legend className="type-small text-ink">Profile {i + 1}</legend>
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1 space-y-1.5">
              <PlatformSelect label={`Platform for profile ${i + 1}`} value={link.platform} onChange={(platform) => update(i, { platform })} />
              <Input
                className={control}
                type="url"
                inputMode="url"
                aria-label={`Web address for profile ${i + 1}`}
                placeholder="https://"
                value={link.url}
                onChange={(e) => update(i, { url: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...data, links: links.filter((_, j) => j !== i) })}
              aria-label={`Remove profile ${i + 1}`}
              className={removeButton}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </fieldset>
      ))}
      <AddRowButton onClick={() => onChange({ ...data, links: [...links, { platform: "", url: "" }] })}>Add profile</AddRowButton>
    </div>
  )
}

export function ImageEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Field label="Image address">
        {(id) => (
          <Input id={id} className={control} type="url" inputMode="url" placeholder="https://" value={data.src || ""} onChange={(e) => onChange({ ...data, src: e.target.value })} />
        )}
      </Field>
      <Field label="Description" hint=" (read aloud by screen readers)">
        {(id) => <Input id={id} className={control} value={data.alt || ""} onChange={(e) => onChange({ ...data, alt: e.target.value })} />}
      </Field>
      <Field label="Caption" hint=" (optional)">
        {(id) => <Input id={id} className={control} value={data.caption || ""} onChange={(e) => onChange({ ...data, caption: e.target.value })} />}
      </Field>
    </div>
  )
}

export function GalleryEditor({ data, onChange }: EditorProps) {
  const images = data.images || []
  return (
    <div className="space-y-4">
      {images.map((img, i) => (
        <Field key={i} label={`Image ${i + 1} address`}>
          {(id) => (
            <div className="flex items-center gap-1">
              <Input
                id={id}
                className={control}
                type="url"
                inputMode="url"
                placeholder="https://"
                value={img.src}
                onChange={(e) => onChange({ ...data, images: images.map((item, j) => (j === i ? { ...item, src: e.target.value } : item)) })}
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...data, images: images.filter((_, j) => j !== i) })}
                  aria-label={`Remove image ${i + 1}`}
                  className={removeButton}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </Field>
      ))}
      <AddRowButton onClick={() => onChange({ ...data, images: [...images, { src: "" }] })}>Add image</AddRowButton>
    </div>
  )
}

export function EmbedEditor({ data, onChange }: EditorProps) {
  return (
    <Field label="Link to embed">
      {(id) => (
        <>
          <Input id={id} className={control} type="url" inputMode="url" placeholder="https://" value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} />
          <p className="type-small font-normal text-ink-soft">Paste a YouTube, Spotify, SoundCloud or TikTok link.</p>
        </>
      )}
    </Field>
  )
}

type FormFieldType = "text" | "email" | "textarea" | "select"

export function FormEditor({ data, onChange }: EditorProps) {
  const fields = data.fields || []
  const update = (i: number, patch: Partial<(typeof fields)[number]>) =>
    onChange({ ...data, fields: fields.map((field, j) => (j === i ? { ...field, ...patch } : field)) })

  return (
    <div className="space-y-4">
      <Field label="Form title">
        {(id) => <Input id={id} className={control} value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} />}
      </Field>
      {fields.map((field, i) => (
        <fieldset key={i} className="space-y-1.5">
          <legend className="type-small text-ink">Field {i + 1}</legend>
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex gap-1.5">
                <Input className={cn(control, "flex-1")} aria-label={`Field ${i + 1} label`} value={field.label} onChange={(e) => update(i, { label: e.target.value })} />
                <select
                  aria-label={`Field ${i + 1} type`}
                  value={field.type || "text"}
                  onChange={(e) => update(i, { type: e.target.value as FormFieldType })}
                  className={cn(selectClass, "w-[7.5rem] shrink-0")}
                >
                  <option value="text">Short text</option>
                  <option value="email">Email</option>
                  <option value="textarea">Long text</option>
                  {!["text", "email", "textarea"].includes(field.type || "text") && <option value={field.type}>{field.type}</option>}
                </select>
              </div>
              <label className="type-small flex min-h-11 items-center gap-2 font-normal text-ink md:min-h-8">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => update(i, { required: e.target.checked })}
                  className="size-4 accent-(--ink)"
                />
                Visitors must fill this in
              </label>
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => onChange({ ...data, fields: fields.filter((_, j) => j !== i) })}
                aria-label={`Remove field ${i + 1}`}
                className={removeButton}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </fieldset>
      ))}
      <AddRowButton onClick={() => onChange({ ...data, fields: [...fields, { label: "New field", type: "text", required: false }] })}>Add field</AddRowButton>
      <Field label="Button text">
        {(id) => <Input id={id} className={control} value={data.buttonText || ""} placeholder="Submit" onChange={(e) => onChange({ ...data, buttonText: e.target.value })} />}
      </Field>
    </div>
  )
}

export function CountdownEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Field label="Title">
        {(id) => <Input id={id} className={control} value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} />}
      </Field>
      <Field label="Counts down to">
        {(id) => (
          <Input id={id} className={cn(control, "tabular")} type="datetime-local" value={data.targetDate || ""} onChange={(e) => onChange({ ...data, targetDate: e.target.value })} />
        )}
      </Field>
    </div>
  )
}

export function ButtonEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Field label="Label">
        {(id) => <Input id={id} className={control} value={data.label || ""} onChange={(e) => onChange({ ...data, label: e.target.value })} />}
      </Field>
      <Field label="Web address">
        {(id) => (
          <Input id={id} className={control} type="url" inputMode="url" placeholder="https://" value={data.url || ""} onChange={(e) => onChange({ ...data, url: e.target.value })} />
        )}
      </Field>
      <Field label="Style">
        {(id) => (
          <select
            id={id}
            value={data.variant || "primary"}
            onChange={(e) => onChange({ ...data, variant: e.target.value as "primary" | "outline" | "ghost" })}
            className={selectClass}
          >
            <option value="primary">Filled</option>
            <option value="outline">Outlined</option>
            <option value="ghost">Text only</option>
          </select>
        )}
      </Field>
      <IconPicker value={data.icon} onChange={(icon) => onChange({ ...data, icon })} />
      <SwitchRow
        label="Full width"
        description="Takes the whole row."
        checked={!!data.fullWidth}
        onCheckedChange={(fullWidth) => onChange({ ...data, fullWidth })}
      />
    </div>
  )
}

export function SpacerEditor({ data, onChange }: EditorProps) {
  const height = data.height || 24
  return (
    <Field label="Height" hint={` (${height}px)`}>
      {(id) => (
        <input
          id={id}
          type="range"
          min={8}
          max={120}
          step={4}
          value={height}
          onChange={(e) => onChange({ ...data, height: parseInt(e.target.value) })}
          className="h-11 w-full cursor-pointer accent-(--pink) md:h-9"
        />
      )}
    </Field>
  )
}

export function VideoEditor({ data, onChange }: EditorProps) {
  return (
    <div className="space-y-4">
      <Field label="Video address">
        {(id) => (
          <Input id={id} className={control} type="url" inputMode="url" placeholder="https://example.com/video.mp4" value={data.src || ""} onChange={(e) => onChange({ ...data, src: e.target.value })} />
        )}
      </Field>
      <Field label="Poster image address" hint=" (optional)">
        {(id) => (
          <Input id={id} className={control} type="url" inputMode="url" placeholder="https://" value={data.poster || ""} onChange={(e) => onChange({ ...data, poster: e.target.value })} />
        )}
      </Field>
      <Field label="Caption" hint=" (optional)">
        {(id) => <Input id={id} className={control} value={data.caption || ""} onChange={(e) => onChange({ ...data, caption: e.target.value })} />}
      </Field>
      <div>
        <SwitchRow label="Start playing on its own" checked={!!data.autoplay} onCheckedChange={(autoplay) => onChange({ ...data, autoplay })} />
        <SwitchRow label="Repeat" checked={!!data.loop} onCheckedChange={(loop) => onChange({ ...data, loop })} />
        <SwitchRow label="Start without sound" checked={!!data.muted} onCheckedChange={(muted) => onChange({ ...data, muted })} />
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
  button: ButtonEditor,
  spacer: SpacerEditor,
  video: VideoEditor,
}
