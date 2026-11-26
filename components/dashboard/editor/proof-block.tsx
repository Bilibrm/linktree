"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EyeOff, GripVertical, Plus } from "lucide-react"
import type { IBlock } from "@/types"
import { cn } from "@/lib/utils"
import { blockMissing, blockSummary, blockTypeInfo } from "./block-types"

/**
 * The `+` line in the gap above a block. Invisible until hovered or focused. Touch screens
 * have no hover, so there the per-block lines are off and the inspector offers
 * "Add a block below" instead.
 */
export function InsertionPoint({ onClick, label, className }: { onClick: () => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group/insert absolute inset-x-0 z-10 flex h-6 items-center opacity-0 transition-opacity duration-150 ease-press outline-none hover:opacity-100 focus-visible:opacity-100",
        className
      )}
    >
      <span className="h-0.5 flex-1 bg-pink" />
      <span className="flex size-5 items-center justify-center rounded-label bg-pink text-on-pink group-focus-visible/insert:outline-2 group-focus-visible/insert:outline-offset-2 group-focus-visible/insert:outline-ink">
        <Plus className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="h-0.5 flex-1 bg-pink" />
    </button>
  )
}

/**
 * One block on the proof: the real rendered block (inert, so links, forms and video do
 * nothing while editing) inside a focusable option, with an insertion point above it and
 * a drag handle that shows on hover or when selected.
 */
export function ProofBlock({
  block,
  index,
  total,
  spanClass,
  selected,
  tabbable,
  fresh,
  flash,
  onSelect,
  onInsertBefore,
  onOptionKeyDown,
  children,
}: {
  block: IBlock
  index: number
  total: number
  spanClass: string
  selected: boolean
  /** Roving tabindex: exactly one option in the list takes Tab. */
  tabbable: boolean
  /** Just inserted or restored: print it in. */
  fresh: boolean
  /** Just moved: flash the misregistered pink outline once. */
  flash: boolean
  onSelect: () => void
  onInsertBefore: () => void
  onOptionKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: block._id,
  })
  const summary = blockSummary(block)
  const missing = blockMissing(block)
  const TypeIcon = blockTypeInfo(block.type).icon

  return (
    <div
      ref={setNodeRef}
      data-block-id={block._id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("group/block relative scroll-mt-8 scroll-mb-8", spanClass, isDragging && "z-20")}
    >
      <InsertionPoint onClick={onInsertBefore} label={`Add a block before ${summary}`} className="-top-[18px] [@media(pointer:coarse)]:hidden" />

      <div
        role="option"
        id={`proof-block-${block._id}`}
        aria-selected={selected}
        aria-label={`${summary}, block ${index + 1} of ${total}${block.isActive ? "" : ", hidden from visitors"}`}
        tabIndex={tabbable ? 0 : -1}
        onClick={onSelect}
        onKeyDown={onOptionKeyDown}
        className={cn(
          "relative h-full cursor-pointer rounded-panel outline-offset-4 outline-ink",
          flash && "press-flash",
          isDragging && "bg-sheet shadow-misregistered outline-2 outline-ink"
        )}
      >
        <div inert className={cn("h-full", fresh && "press-print-in", !block.isActive && "opacity-40")}>
          {missing ? (
            // Editor only: visitors see nothing until the block has its content.
            <div className="type-small flex min-h-16 items-center gap-2.5 rounded-panel border border-dashed border-ink bg-sheet px-3 py-2 font-normal text-ink">
              <TypeIcon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {missing}
            </div>
          ) : (
            children
          )}
        </div>

        {/* Selection: 2px pink, drawn 4px outside the block so it never covers content. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-panel border-2 border-pink transition-[opacity,transform] duration-150 ease-press",
            selected && !isDragging ? "scale-100 opacity-100" : "scale-[0.985] opacity-0",
            !selected && !isDragging && "group-hover/block:scale-100 group-hover/block:border-rule-strong group-hover/block:opacity-100"
          )}
        />

        {!block.isActive && (
          <span className="type-micro pointer-events-none absolute top-1.5 left-1.5 flex items-center gap-1 rounded-label bg-ink px-1.5 py-0.5 text-paper">
            <EyeOff className="size-3" aria-hidden="true" />
            Hidden
          </span>
        )}
      </div>

      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        tabIndex={selected ? 0 : -1}
        aria-label={`Drag to move ${summary}`}
        suppressHydrationWarning
        className={cn(
          "absolute -top-3 right-1 z-10 flex h-6 w-7 cursor-grab touch-none items-center justify-center rounded-label border border-ink bg-sheet text-ink transition-opacity duration-150 ease-press active:cursor-grabbing",
          "before:absolute before:-inset-2.5 before:content-['']",
          selected || isDragging ? "opacity-100" : "opacity-0 group-hover/block:opacity-100 focus-visible:opacity-100"
        )}
      >
        <GripVertical className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}
