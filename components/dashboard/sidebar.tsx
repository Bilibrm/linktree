"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeftClose, PanelLeft, ArrowUpRight, LogOut, Menu, Link2, Palette, BarChart3, Settings, Sun, Moon } from "lucide-react"
import { useDashboardTheme } from "./theme-provider"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const navItems = [
  { href: "/dashboard", label: "Links & Blocks", icon: Link2 },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ username, pageId }: { username: string; pageId: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { dark, toggle } = useDashboardTheme()

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-6">
        <Link href="/dashboard" className={`font-display font-black text-lg tracking-tight text-foreground ${collapsed ? "block text-center" : ""}`}>
          {collapsed ? "LN" : "LinkNest"}
        </Link>
        {!collapsed && (
          <a
            href={`/${username}`}
            target="_blank"
            className="flex items-center gap-1 text-small text-muted-foreground hover:text-foreground mt-1.5 truncate transition-colors"
          >
            linknest.app/{username}
            <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
          </a>
        )}
      </div>
      <div className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-caption transition-all relative ${
                isActive
                  ? "text-gold font-semibold bg-gold/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-gold" />}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </div>
      <div className="px-2 pb-4 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-caption text-muted-foreground hover:text-foreground hover:bg-sidebar-accent w-full transition-all ${collapsed ? "justify-center px-2" : ""}`}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> Collapse</>}
        </button>
        <button
          onClick={toggle}
          className={`flex items-center gap-3 rounded-lg px-3 min-h-[44px] text-caption text-muted-foreground hover:text-foreground hover:bg-sidebar-accent w-full transition-all ${collapsed ? "justify-center px-2" : ""}`}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && (dark ? "Light mode" : "Dark mode")}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogoutConfirm(true)}
          className={`w-full min-h-[44px] text-caption text-muted-foreground hover:text-foreground hover:bg-sidebar-accent justify-start ${collapsed ? "px-0 justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Log out</span>}
        </Button>
      </div>
    </nav>
  )

  async function handleLogout() {
    await logoutAction()
  }

  return (
    <>
      <aside
        className={`hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
      >
        {nav}
      </aside>
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Log out"
        description="Are you sure you want to log out? You'll need to sign in again to manage your page."
        confirmLabel="Log out"
        onConfirm={handleLogout}
      />
      <Sheet>
        <SheetTrigger asChild className="md:hidden fixed top-3 left-3 z-50">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-foreground">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <ScrollArea className="h-full">{nav}</ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
