"use client"

import type { BlockType } from "@/types"
import { CommandDialog, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { BLOCK_TYPES } from "./block-types"

/** Block picker (§8.4): search every block type, one line on what each one does. */
export function BlockPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (type: BlockType) => void
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add a block"
      description="Search the block types, then press Enter to add one."
      className="sm:max-w-md"
    >
      <Command>
        <CommandInput placeholder="Search blocks" aria-label="Search blocks" className="text-base md:text-sm" />
        <CommandList className="max-h-[min(24rem,60dvh)]">
          <CommandEmpty>No block matches that. Try &ldquo;link&rdquo; or &ldquo;form&rdquo;.</CommandEmpty>
          <CommandGroup>
            {BLOCK_TYPES.map(({ type, label, icon: Icon, description, keywords }) => (
              <CommandItem
                key={type}
                value={label}
                keywords={[description, keywords]}
                onSelect={() => onPick(type)}
                className="min-h-12 gap-3 px-2.5"
              >
                <Icon className="size-[18px] text-ink" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex min-w-0 flex-col">
                  <span className="type-small font-semibold text-ink">{label}</span>
                  <span className="type-small font-normal text-ink-soft">{description}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
