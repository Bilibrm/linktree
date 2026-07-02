"use client"

import { useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { IBlock } from "@/types"
import { SortableBlock } from "./sortable-block"
import { reorderBlocks } from "@/lib/actions/blocks"
import { toast } from "sonner"

export function BlockList({
  blocks,
  pageId,
  onBlocksChange,
}: {
  blocks: IBlock[]
  pageId: string
  onBlocksChange: (blocks: IBlock[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleBlockUpdate = useCallback(
    (updatedBlock: IBlock) => {
      onBlocksChange(blocks.map((b) => (b._id === updatedBlock._id ? updatedBlock : b)))
    },
    [blocks, onBlocksChange]
  )

  const handleBlockDelete = useCallback(
    (blockId: string) => {
      onBlocksChange(blocks.filter((b) => b._id !== blockId))
    },
    [blocks, onBlocksChange]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = blocks.findIndex((i) => i._id === active.id)
      const newIndex = blocks.findIndex((i) => i._id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newItems = arrayMove(blocks, oldIndex, newIndex)
      onBlocksChange(newItems)

      const reorderData = newItems.map((block, idx) => ({
        _id: block._id,
        order: idx,
      }))

      const formData = new FormData()
      formData.append("blocks", JSON.stringify(reorderData))
      const result: any = await reorderBlocks(formData)
      if (result?.error) {
        toast.error("Failed to reorder blocks")
        onBlocksChange(blocks)
      }
    },
    [blocks, onBlocksChange]
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {blocks.map((block) => (
            <SortableBlock key={block._id} block={block} pageId={pageId} onBlockUpdate={handleBlockUpdate} onBlockDelete={handleBlockDelete} />
          ))}
          {blocks.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-display text-heading text-bone mb-2">No blocks yet</p>
              <p className="text-caption">Click &ldquo;Add block&rdquo; to get started.</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
