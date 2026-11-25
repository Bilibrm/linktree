"use client"

import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { FlatBlockData } from "@/lib/validation"
import type { BlockType, IBlock, ThemeConfig } from "@/types"
import { resolveTheme } from "@/lib/themes"
import { createBlock, deleteBlock, reorderBlocks, updateBlock } from "@/lib/actions/blocks"
import { updateMyPage, updateMyProfile } from "@/lib/actions/page"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { PublicPreview } from "@/components/blocks/public-preview"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useSaveState } from "@/components/dashboard/save-state"
import { cn } from "@/lib/utils"
import { BlockPicker } from "./block-picker"
import { BLOCK_TYPES, blockTypeInfo, defaultBlockData } from "./block-types"
import { BlockInspector, PageBasics, type PageBasicsValue } from "./inspector"
import { InsertionPoint, ProofBlock } from "./proof-block"

/** Selection value for the page's own header (name, bio, photo). */
const PAGE = "page"
const SAVE_DELAY = 600
const EASE = "cubic-bezier(0.2, 0, 0, 1)"
const SUGGESTED: BlockType[] = ["link", "social", "text"]

const desktopQuery = "(min-width: 768px)"
function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(desktopQuery)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

/**
 * The editor (DESIGN_SYSTEM.md §8.4). The proof in the middle is the owner's real page,
 * drawn by the same renderers as `/[username]`. Blocks are selected on it, edited in the
 * inspector, and every change saves by itself.
 */
export function EditorClient({
  pageId,
  username,
  initialBlocks,
  theme,
  initialBasics,
}: {
  pageId: string
  username: string
  initialBlocks: IBlock[]
  theme?: ThemeConfig
  initialBasics: PageBasicsValue
}) {
  const { run, forget } = useSaveState()
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => false
  )

  // Local state is the source of truth after mount. Server actions revalidate the route,
  // but the props are only read once, so a refresh never overwrites what is being typed.
  const [blocks, setBlocks] = useState(initialBlocks)
  const blocksRef = useRef(initialBlocks)
  const [basics, setBasics] = useState(initialBasics)
  const basicsRef = useRef(initialBasics)
  const [selected, setSelected] = useState<string | null>(null)
  const [picker, setPicker] = useState({ open: false, index: 0 })
  const [freshId, setFreshId] = useState<string | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [live, setLive] = useState("")

  const canvasRef = useRef<HTMLDivElement>(null)
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const basicsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const flipFrom = useRef<Map<string, DOMRect> | null>(null)
  const focusFieldFor = useRef<string | null>(null)
  const insertCount = useRef(0)
  const deletions = useRef(new Map<string, Promise<boolean>>())

  const selectedBlock = blocks.find((b) => b._id === selected)
  const selectedIndex = selectedBlock ? blocks.indexOf(selectedBlock) : -1

  /* ── state plumbing ── */

  /** Replace the block list. `slide` records where blocks are now, so they can FLIP. */
  const commit = useCallback((next: IBlock[], slide = false) => {
    if (slide && canvasRef.current && motionAllowed()) {
      const rects = new Map<string, DOMRect>()
      canvasRef.current.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) => {
        rects.set(el.dataset.blockId as string, el.getBoundingClientRect())
      })
      flipFrom.current = rects
    }
    blocksRef.current = next
    setBlocks(next)
  }, [])

  // FLIP: blocks slide from where they were to where the new order puts them (§6.2).
  useLayoutEffect(() => {
    const from = flipFrom.current
    flipFrom.current = null
    if (!from || !canvasRef.current) return
    canvasRef.current.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) => {
      const before = from.get(el.dataset.blockId as string)
      if (!before) return
      const after = el.getBoundingClientRect()
      const dx = before.left - after.left
      const dy = before.top - after.top
      if (dx === 0 && dy === 0) return
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 220, easing: EASE })
    })
  }, [blocks])

  /** Show a one-shot mark (print-in or moved flash) on a block, then clear it. */
  const mark = useCallback((set: (id: string | null) => void, id: string, ms: number) => {
    set(id)
    markTimers.current.push(setTimeout(() => set(null), ms))
  }, [])

  /* ── autosave ── */

  const saveBlock = useCallback(
    (id: string) => {
      const timer = saveTimers.current.get(id)
      if (timer) clearTimeout(timer)
      saveTimers.current.delete(id)
      // The task reads the block when it runs, so a retry sends the latest edit.
      void run(`block:${id}`, async () => {
        const block = blocksRef.current.find((b) => b._id === id)
        if (!block) return
        const fd = new FormData()
        fd.append("data", JSON.stringify(block.data))
        fd.append("isActive", String(block.isActive))
        const result = await updateBlock(id, fd)
        if (!result?.success) throw new Error("Block not saved")
      })
    },
    [run]
  )

  const saveBasics = useCallback(() => {
    if (basicsTimer.current) clearTimeout(basicsTimer.current)
    basicsTimer.current = null
    void run("page", async () => {
      const fd = new FormData()
      fd.append("title", basicsRef.current.title)
      fd.append("bio", basicsRef.current.bio)
      const result = await updateMyPage(fd)
      if (!result?.success) throw new Error("Page not saved")
    })
    void run("profile", async () => {
      const fd = new FormData()
      fd.append("name", basicsRef.current.displayName)
      fd.append("avatarUrl", basicsRef.current.avatarUrl)
      const result = await updateMyProfile(fd)
      if (!result?.success) throw new Error("Profile not saved")
    })
  }, [run])

  /** Send anything still waiting on its debounce: on deselect, tab change, page hide. */
  const flushSaves = useCallback(() => {
    for (const id of [...saveTimers.current.keys()]) saveBlock(id)
    if (basicsTimer.current) saveBasics()
  }, [saveBlock, saveBasics])

  useEffect(() => {
    const timers = markTimers.current
    window.addEventListener("pagehide", flushSaves)
    return () => {
      window.removeEventListener("pagehide", flushSaves)
      flushSaves()
      timers.forEach(clearTimeout)
    }
  }, [flushSaves])

  /* ── actions ── */

  const select = useCallback(
    (id: string | null) => {
      flushSaves()
      setSelected(id)
    },
    [flushSaves]
  )

  function updateData(id: string, data: FlatBlockData) {
    commit(blocksRef.current.map((b) => (b._id === id ? { ...b, data } : b)))
    const timer = saveTimers.current.get(id)
    if (timer) clearTimeout(timer)
    saveTimers.current.set(id, setTimeout(() => saveBlock(id), SAVE_DELAY))
  }

  function toggleVisible(id: string) {
    const block = blocksRef.current.find((b) => b._id === id)
    if (!block) return
    commit(blocksRef.current.map((b) => (b._id === id ? { ...b, isActive: !b.isActive } : b)))
    saveBlock(id)
    setLive(block.isActive ? "Block hidden from visitors" : "Block shown on your page")
  }

  function updateBasics(patch: Partial<PageBasicsValue>) {
    const next = { ...basicsRef.current, ...patch }
    basicsRef.current = next
    setBasics(next)
    if (basicsTimer.current) clearTimeout(basicsTimer.current)
    basicsTimer.current = setTimeout(saveBasics, SAVE_DELAY)
  }

  async function uploadAvatar(file: File) {
    const fd = new FormData()
    fd.append("file", file)
    try {
      const result = await uploadToCloudinary(fd)
      if (!result.success || !result.url) return "The photo didn't upload. Try again, or use a smaller file."
      updateBasics({ avatarUrl: result.url })
      saveBasics()
    } catch {
      return "The photo didn't upload. Check your connection and try again."
    }
  }

  function openPicker(index?: number) {
    const fallback = selectedIndex >= 0 ? selectedIndex + 1 : blocksRef.current.length
    setPicker({ open: true, index: index ?? fallback })
  }

  async function insert(type: BlockType, index: number) {
    setPicker((p) => ({ ...p, open: false }))
    const fd = new FormData()
    fd.append("pageId", pageId)
    fd.append("type", type)
    fd.append("data", JSON.stringify(defaultBlockData(type)))
    fd.append("position", String(index))
    // Wait for the real id before showing the block: swapping a temporary id later would
    // remount the inspector under the owner's cursor.
    const ok = await run(`insert:${(insertCount.current += 1)}`, async () => {
      const result = await createBlock(fd)
      if (!result || !("block" in result) || !result.block) throw new Error("Block not created")
      const block = result.block as IBlock
      const current = blocksRef.current
      const at = Math.min(index, current.length)
      commit([...current.slice(0, at), block, ...current.slice(at)], true)
      mark(setFreshId, block._id, 320)
      focusFieldFor.current = block._id
      setSelected(block._id)
      setLive(`${blockTypeInfo(type).label} added at position ${at + 1}`)
    })
    if (!ok) toast.error("That block wasn't added. Check your connection, then press Retry at the top.")
  }

  const persistOrder = useCallback(() => {
    void run("order", async () => {
      const fd = new FormData()
      fd.append("blocks", JSON.stringify(blocksRef.current.map((b, order) => ({ _id: b._id, order }))))
      const result = await reorderBlocks(fd)
      if (!result?.success) throw new Error("Order not saved")
    })
  }, [run])

  const moveBlock = useCallback(
    (id: string, to: number, slide: boolean) => {
      const current = blocksRef.current
      const from = current.findIndex((b) => b._id === id)
      if (from === -1 || to < 0 || to >= current.length || to === from) return
      commit(arrayMove(current, from, to), slide)
      mark(setFlashId, id, 420)
      persistOrder()
      setLive(`Block moved to position ${to + 1}`)
    },
    [commit, mark, persistOrder]
  )

  function moveBy(id: string, delta: -1 | 1) {
    const from = blocksRef.current.findIndex((b) => b._id === id)
    moveBlock(id, from + delta, true)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const to = blocksRef.current.findIndex((b) => b._id === over.id)
    // dnd-kit settles the dropped block itself, so no FLIP here.
    moveBlock(String(active.id), to, false)
  }

  async function restore(block: IBlock, index: number) {
    const deleted = await deletions.current.get(block._id)
    deletions.current.delete(block._id)
    const putBack = () => {
      const current = blocksRef.current
      if (current.some((b) => b._id === block._id)) return
      const at = Math.min(index, current.length)
      commit([...current.slice(0, at), block, ...current.slice(at)], true)
      mark(setFreshId, block._id, 320)
      setSelected(block._id)
      setLive("Block restored")
    }
    if (deleted === false) {
      // The delete never reached the server: drop it from the retry list and show the block again.
      forget(`delete:${block._id}`)
      putBack()
      return
    }
    const fd = new FormData()
    fd.append("pageId", pageId)
    fd.append("type", block.type)
    fd.append("data", JSON.stringify(block.data))
    fd.append("position", String(index))
    fd.append("restoreId", block._id)
    fd.append("isActive", String(block.isActive))
    const ok = await run(`restore:${block._id}`, async () => {
      const result = await createBlock(fd)
      if (!result || !("block" in result) || !result.block) throw new Error("Block not restored")
      putBack()
    })
    if (!ok) toast.error("That block wasn't restored. Press Retry at the top to try again.")
  }

  function remove(id: string) {
    const current = blocksRef.current
    const index = current.findIndex((b) => b._id === id)
    const block = current[index]
    if (!block) return

    const timer = saveTimers.current.get(id)
    if (timer) clearTimeout(timer)
    saveTimers.current.delete(id)
    setSelected((s) => (s === id ? null : s))

    const el = canvasRef.current?.querySelector<HTMLElement>(`[data-block-id="${id}"]`)
    const hadFocus = !!el && el.contains(document.activeElement)
    const finish = () => {
      commit(blocksRef.current.filter((b) => b._id !== id), true)
      if (hadFocus) {
        requestAnimationFrame(() => canvasRef.current?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')?.focus())
      }
    }
    // Lifts away (§6.2), then the blocks below slide up.
    if (el && motionAllowed()) {
      el.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(-10px) scale(0.98)" },
        ],
        { duration: 180, easing: EASE, fill: "forwards" }
      ).finished.then(finish, finish)
    } else {
      finish()
    }

    deletions.current.set(
      id,
      run(`delete:${id}`, async () => {
        const result = await deleteBlock(id)
        if (!result?.success) throw new Error("Block not deleted")
      })
    )
    toast("Block deleted", {
      duration: 6000,
      action: { label: "Undo", onClick: () => void restore(block, index) },
    })
    setLive("Block deleted. Undo available")
  }

  /* ── keyboard ── */

  const onWindowKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented) return
    const typing = isTypingTarget(event.target)

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault()
      openPicker()
      return
    }
    if (picker.open) return
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      openPicker()
      return
    }
    if (event.key === "Escape" && selected !== null) {
      select(null)
      return
    }
    if (event.altKey && !typing && selectedBlock && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault()
      moveBy(selectedBlock._id, event.key === "ArrowUp" ? -1 : 1)
    }
  })

  useEffect(() => {
    const handler = (event: KeyboardEvent) => onWindowKeyDown(event)
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  function onOptionKeyDown(event: React.KeyboardEvent<HTMLDivElement>, block: IBlock, index: number) {
    if (event.target !== event.currentTarget || event.altKey) return
    const focusOption = (i: number) => {
      const target = blocksRef.current[i]
      if (target) document.getElementById(`proof-block-${target._id}`)?.focus()
    }
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault()
        select(block._id)
        break
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault()
        focusOption(index + 1)
        break
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault()
        focusOption(index - 1)
        break
      case "Home":
        event.preventDefault()
        focusOption(0)
        break
      case "End":
        event.preventDefault()
        focusOption(blocksRef.current.length - 1)
        break
      case "Delete":
      case "Backspace":
        event.preventDefault()
        remove(block._id)
        break
    }
  }

  // After a selection change: keep the block in view, and put the cursor in the first
  // field of a block that was just added.
  useEffect(() => {
    if (!selected || selected === PAGE) return
    const el = canvasRef.current?.querySelector<HTMLElement>(`[data-block-id="${selected}"]`)
    el?.scrollIntoView({ block: isDesktop ? "nearest" : "start", behavior: motionAllowed() ? "smooth" : "auto" })
    if (focusFieldFor.current !== selected) return
    focusFieldFor.current = null
    const timer = setTimeout(() => {
      document.querySelector<HTMLElement>("[data-inspector] :is(input:not([type=file]), textarea, select, [role=combobox])")?.focus()
    }, 80)
    return () => clearTimeout(timer)
  }, [selected, isDesktop])

  /* ── render ── */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  // The proof stays still: the editor answers actions with its own motion, and the
  // theme's entrance would replay on every insert.
  const proofTheme = useMemo(() => resolveTheme(theme), [theme])
  const tabbableId = selectedBlock?._id ?? blocks[0]?._id

  const inspector = selectedBlock ? (
    <BlockInspector
      block={selectedBlock}
      index={selectedIndex}
      total={blocks.length}
      onChange={(data) => updateData(selectedBlock._id, data)}
      onToggleVisible={() => toggleVisible(selectedBlock._id)}
      onMove={(delta) => moveBy(selectedBlock._id, delta)}
      onAddBelow={() => openPicker(selectedIndex + 1)}
      onDelete={() => remove(selectedBlock._id)}
    />
  ) : (
    <PageBasics value={basics} username={username} onChange={updateBasics} onUploadAvatar={uploadAvatar} />
  )
  const sheetOpen = !isDesktop && selected !== null

  return (
    <div className="flex h-full min-h-0">
      <div
        ref={canvasRef}
        data-canvas
        className="min-w-0 flex-1 overflow-y-auto"
        onClick={(event) => {
          if (event.target instanceof HTMLElement && event.target.hasAttribute("data-canvas")) select(null)
        }}
      >
        <div data-canvas className={cn("mx-auto min-h-full w-full max-w-[438px] px-4 py-6 md:py-10", sheetOpen && "pb-[62dvh]")}>
          <h1 className="sr-only">Your page</h1>

          <DndContext id="proof" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b._id)} strategy={rectSortingStrategy}>
              <PublicPreview
                blocks={blocks}
                username={username}
                displayName={basics.displayName || username}
                avatarUrl={basics.avatarUrl || undefined}
                bio={basics.bio}
                title={basics.title}
                theme={proofTheme}
                showInactive
                className="border-ink shadow-offset"
                gridProps={{ role: "listbox", "aria-label": "Blocks on your page", "aria-orientation": "vertical" }}
                renderHeader={(content) => (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected === PAGE}
                    aria-label="Page header. Edit your name, bio and photo"
                    onClick={() => select(PAGE)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return
                      event.preventDefault()
                      select(PAGE)
                    }}
                    className="group/header relative w-full cursor-pointer rounded-panel outline-offset-4"
                  >
                    <div inert>{content}</div>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute -inset-2 rounded-panel border-2 transition-[opacity,transform] duration-150 ease-press",
                        selected === PAGE
                          ? "scale-100 border-pink opacity-100"
                          : "scale-[0.985] border-rule-strong opacity-0 group-hover/header:scale-100 group-hover/header:opacity-100"
                      )}
                    />
                  </div>
                )}
                renderBlock={(block, index, content, itemProps) => (
                  <ProofBlock
                    key={block._id}
                    block={block}
                    index={index}
                    total={blocks.length}
                    spanClass={itemProps.className}
                    selected={selected === block._id}
                    tabbable={tabbableId === block._id}
                    fresh={freshId === block._id}
                    flash={flashId === block._id}
                    onSelect={() => select(block._id)}
                    onInsertBefore={() => openPicker(index)}
                    onOptionKeyDown={(event) => onOptionKeyDown(event, block, index)}
                  >
                    {content}
                  </ProofBlock>
                )}
                empty={
                  <div className="mt-8 w-full rounded-panel border border-dashed border-ink bg-sheet p-4 text-left text-ink">
                    <p className="type-title-3">Add your first block</p>
                    <p className="type-small mt-1 font-normal text-ink-soft">Most pages start with one of these.</p>
                    <div className="mt-4 grid gap-2">
                      {SUGGESTED.map((type) => {
                        const { label, icon: Icon, description } = blockTypeInfo(type)
                        return (
                          <Button key={type} variant="outline" className="h-auto min-h-12 justify-start gap-3 px-3 py-2 text-left whitespace-normal" onClick={() => void insert(type, 0)}>
                            <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                            <span className="flex flex-col">
                              <span className="type-small font-semibold">{label}</span>
                              <span className="type-small font-normal text-ink-soft">{description}</span>
                            </span>
                          </Button>
                        )
                      })}
                    </div>
                    <Button variant="link" className="mt-2 h-11 px-0" onClick={() => openPicker(0)}>
                      See all {BLOCK_TYPES.length} blocks
                    </Button>
                  </div>
                }
              />
            </SortableContext>
          </DndContext>

          {blocks.length > 0 && (
            <div className="relative mt-5">
              <InsertionPoint onClick={() => openPicker(blocks.length)} label="Add a block at the end" className="-top-[22px] hidden md:flex" />
              <Button variant="pink" size="touch" className="w-full" onClick={() => openPicker(blocks.length)}>
                <Plus aria-hidden="true" />
                Add block
              </Button>
              <p className="type-small mt-3 hidden text-center font-normal text-ink-soft md:block">
                Press / to add a block. Alt with the up or down arrow moves the selected one.
              </p>
            </div>
          )}
        </div>
      </div>

      <aside aria-label="Inspector" className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-rule bg-sheet md:block">
        {isDesktop && inspector}
      </aside>

      {!isDesktop && (
        <Sheet open={sheetOpen} onOpenChange={(open) => !open && select(null)} modal={false}>
          <SheetContent
            side="bottom"
            aria-describedby={undefined}
            onInteractOutside={(event) => event.preventDefault()}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="max-h-[58dvh] gap-0 overflow-y-auto rounded-t-panel border-ink pb-[env(safe-area-inset-bottom)]"
          >
            <SheetTitle className="sr-only">{selectedBlock ? `Edit ${blockTypeInfo(selectedBlock.type).label}` : "Edit page header"}</SheetTitle>
            {inspector}
          </SheetContent>
        </Sheet>
      )}

      <BlockPicker open={picker.open} onOpenChange={(open) => setPicker((p) => ({ ...p, open }))} onPick={(type) => void insert(type, picker.index)} />

      <p role="status" aria-live="polite" className="sr-only">
        {live}
      </p>
    </div>
  )
}
