"use client"

/// <reference types="react/canary" />
import { ViewTransition } from "react"
import { usePathname } from "next/navigation"

/**
 * Crossfades the dashboard content when the tab changes (DESIGN_SYSTEM.md §6.2).
 * Keyed by path so a tab change is an exit plus an enter; `update="none"` keeps route
 * refreshes (every autosave triggers one) from animating the editor under the owner's hands.
 */
export function TabTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <ViewTransition key={pathname} update="none">
      {children}
    </ViewTransition>
  )
}
