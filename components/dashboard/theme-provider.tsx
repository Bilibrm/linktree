"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ThemeContextType = {
  dark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggle: () => {} })

export function useDashboardTheme() {
  return useContext(ThemeContext)
}

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("linknest-dashboard-theme")
    if (stored === "light") setDark(false)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("linknest-dashboard-theme", dark ? "dark" : "light")
    }
  }, [dark, mounted])

  function toggle() {
    setDark((d) => !d)
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? "dark" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
