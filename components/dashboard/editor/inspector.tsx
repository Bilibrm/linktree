"use client"

import { useId, useRef, useState } from "react"
import { ArrowDown, ArrowUp, Camera, Loader2, Plus, Trash2, UserRound } from "lucide-react"
import type { FlatBlockData } from "@/lib/validation"
import type { IBlock } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { editors, SwitchRow } from "@/components/dashboard/block-editors"
import { blockTypeInfo } from "./block-types"

export const INSPECTOR_TITLE_ID = "inspector-title"

function InspectorHeader({ icon: Icon, title, meta }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; meta?: string }) {
  return (
    <header className="flex items-center gap-2.5 border-b border-rule px-4 py-3">
      <Icon className="size-[18px] shrink-0 text-ink" strokeWidth={1.75} aria-hidden />
      <h2 id={INSPECTOR_TITLE_ID} className="type-title-3 text-ink">
        {title}
      </h2>
      {meta && <p className="type-micro tabular ml-auto pr-8 font-medium text-ink-soft md:pr-0">{meta}</p>}
    </header>
  )
}

/** Fields for the selected block: content, then options, then delete (§8.4). */
export function BlockInspector({
  block,
  index,
  total,
  onChange,
  onToggleVisible,
  onMove,
  onAddBelow,
  onDelete,
}: {
  block: IBlock
  index: number
  total: number
  onChange: (data: FlatBlockData) => void
  onToggleVisible: () => void
  onMove: (delta: -1 | 1) => void
  onAddBelow: () => void
  onDelete: () => void
}) {
  const info = blockTypeInfo(block.type)
  const Editor = editors[block.type]

  return (
    <section aria-labelledby={INSPECTOR_TITLE_ID} data-inspector>
      <InspectorHeader icon={info.icon} title={info.label} meta={`Block ${index + 1} of ${total}`} />
      <div key={block._id} className="press-slide-in space-y-6 p-4">
        {Editor ? (
          <Editor data={block.data} onChange={onChange} />
        ) : (
          <p className="type-small font-normal text-ink-soft">{info.description}. It has nothing to fill in.</p>
        )}

        <div className="space-y-3 border-t border-rule pt-4">
          <SwitchRow
            label="Show on your page"
            description="Turn off to hide it from visitors and keep it here."
            checked={block.isActive}
            onCheckedChange={onToggleVisible}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="h-11 flex-1 md:h-9" disabled={index === 0} onClick={() => onMove(-1)}>
              <ArrowUp aria-hidden="true" />
              Move up
            </Button>
            <Button variant="outline" className="h-11 flex-1 md:h-9" disabled={index === total - 1} onClick={() => onMove(1)}>
              <ArrowDown aria-hidden="true" />
              Move down
            </Button>
          </div>
          <Button variant="outline" className="h-11 w-full md:h-9" onClick={onAddBelow}>
            <Plus aria-hidden="true" />
            Add a block below
          </Button>
        </div>

        <div className="border-t border-rule pt-4">
          <Button
            variant="outline"
            className="h-11 w-full text-danger-ink hover:border-danger hover:bg-transparent md:h-9"
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" />
            Delete block
          </Button>
        </div>
      </div>
    </section>
  )
}

export type PageBasicsValue = {
  displayName: string
  title: string
  bio: string
  avatarUrl: string
}

/** Nothing selected: the page's own header (§8.4). */
export function PageBasics({
  value,
  username,
  onChange,
  onUploadAvatar,
}: {
  value: PageBasicsValue
  username: string
  onChange: (patch: Partial<PageBasicsValue>) => void
  /** Uploads the file and resolves with an error message, or nothing when it worked. */
  onUploadAvatar: (file: File) => Promise<string | void>
}) {
  const ids = { name: useId(), title: useId(), bio: useId(), photo: useId() }
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    setUploadError("")
    const message = await onUploadAvatar(file)
    setUploadError(message || "")
    setUploading(false)
  }

  return (
    <section aria-labelledby={INSPECTOR_TITLE_ID} data-inspector>
      <InspectorHeader icon={UserRound} title="Page header" />
      <div className="press-slide-in space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rule-strong bg-tint text-lg font-bold text-ink">
            {value.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- owner-supplied avatar URL; its host is not guaranteed to be in next.config remotePatterns
              <img src={value.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (value.displayName || username).charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <Button variant="outline" className="h-11 md:h-9" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Camera aria-hidden="true" />}
              {value.avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            <input ref={fileRef} id={ids.photo} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label="Photo file" onChange={handleFile} />
            <p role="alert" className="type-small mt-1 font-normal text-danger-ink empty:hidden">
              {uploadError}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={ids.name} className="type-small text-ink">
            Display name
          </Label>
          <Input id={ids.name} className="h-11 md:h-9" maxLength={60} placeholder={username} value={value.displayName} onChange={(e) => onChange({ displayName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={ids.title} className="type-small text-ink">
            Tagline <span className="font-normal text-ink-soft">(optional)</span>
          </Label>
          <Input id={ids.title} className="h-11 md:h-9" maxLength={100} value={value.title} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={ids.bio} className="type-small text-ink">
            Bio <span className="font-normal text-ink-soft">(optional)</span>
          </Label>
          <Textarea id={ids.bio} rows={4} maxLength={500} className="resize-y" value={value.bio} onChange={(e) => onChange({ bio: e.target.value })} />
        </div>
        <p className="type-small border-t border-rule pt-4 font-normal text-ink-soft">
          Select a block on your page to edit it. Press <kbd className="rounded-label border border-rule-strong px-1 font-semibold text-ink">/</kbd> to add one.
        </p>
      </div>
    </section>
  )
}
