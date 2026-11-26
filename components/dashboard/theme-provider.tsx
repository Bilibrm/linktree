"use client"

import { createContext, useContext, useEffect, useSyncExternalStore } from "react"
import { useIsClient } from "@/lib/use-is-client"

type ThemeContextType = {
  dark: boolean
  toggle: () => void
}

const STORAGE_KEY = "linknest-dashboard-theme"
const CHANGE_EVENT = "linknest-dashboard-theme-change"
const SYSTEM_DARK = "(prefers-color-scheme: dark)"

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggle: () => {} })

export function useDashboardTheme() {
  return useContext(ThemeContext)
}

/** The dashboard follows the system until the owner picks a side with the toggle. */
function readDark(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "light") return false
  if (stored === "dark") return true
  return window.matchMedia(SYSTEM_DARK).matches
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(SYSTEM_DARK)
  mq.addEventListener("change", onChange)
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    mq.removeEventListener("change", onChange)
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  // The server cannot know the preference, so it renders darkroom and the client corrects
  // it right after hydration; the wrapper stays transparent until then.
  const dark = useSyncExternalStore(subscribe, readDark, () => true)
  const mounted = useIsClient()

  // Dialogs, sheets, popovers and toasts portal into <body>, outside this wrapper. Putting
  // the class on <html> while the dashboard is mounted makes them follow the same theme;
  // it is removed on the way out so landing, auth and public pages stay on paper.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", dark)
    return () => root.classList.remove("dark")
  }, [dark])

  function toggle() {
    localStorage.setItem(STORAGE_KEY, dark ? "light" : "dark")
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? "dark" : ""} style={{ opacity: mounted ? 1 : 0, transition: "opacity 150ms var(--ease-press)" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
