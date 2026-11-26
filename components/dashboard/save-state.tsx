"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

export type SaveStatus = "saved" | "saving" | "error"

type Task = () => Promise<void>

type SaveContext = {
  status: SaveStatus
  /**
   * Run one save. `key` names what is being saved (a block id, "page"); a newer save
   * under the same key replaces an older failed one. The task must throw when it fails.
   * Resolves either way, so callers can chain without their own try/catch.
   */
  run: (key: string, task: Task) => Promise<boolean>
  /** Drop a failed save from the retry list (the change was undone another way). */
  forget: (key: string) => void
  /** Run every save that failed again. Tasks read the latest data when they run. */
  retry: () => void
}

const Ctx = createContext<SaveContext>({
  status: "saved",
  run: async (_key, task) => {
    try {
      await task()
      return true
    } catch {
      return false
    }
  },
  forget: () => {},
  retry: () => {},
})

export function useSaveState() {
  return useContext(Ctx)
}

/** Sits in the dashboard shell so the top bar can show what the editor is doing. */
export function SaveStateProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>("saved")
  const pending = useRef(0)
  const failed = useRef(new Map<string, Task>())

  const sync = useCallback(() => {
    setStatus(pending.current > 0 ? "saving" : failed.current.size > 0 ? "error" : "saved")
  }, [])

  const run = useCallback(
    async (key: string, task: Task) => {
      failed.current.delete(key)
      pending.current += 1
      sync()
      let ok = true
      try {
        await task()
      } catch {
        ok = false
        failed.current.set(key, task)
      }
      pending.current -= 1
      sync()
      return ok
    },
    [sync]
  )

  const forget = useCallback(
    (key: string) => {
      failed.current.delete(key)
      sync()
    },
    [sync]
  )

  const retry = useCallback(() => {
    for (const [key, task] of [...failed.current]) void run(key, task)
  }, [run])

  const value = useMemo(() => ({ status, run, forget, retry }), [status, run, forget, retry])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
