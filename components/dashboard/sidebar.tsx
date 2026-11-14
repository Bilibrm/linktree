"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutPanelTop, Palette, Settings } from "lucide-react"
import { Mark } from "@/components/brand/wordmark"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Page", icon: LayoutPanelTop },
  { href: "/dashboard/appearance", label: "Look", icon: Palette },
  { href: "/dashboard/analytics", label: "Stats", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

/**
 * Dashboard navigation (DESIGN_SYSTEM.md §8.3): a 64px rail on the left from 768px up,
 * a bottom tab bar below that. The current tab is marked by a pink bar and heavier
 * type as well as `aria-current`, never by color alone.
 */
export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-rule bg-sheet pb-[env(safe-area-inset-bottom)] md:static md:z-auto md:w-16 md:shrink-0 md:flex-col md:border-t-0 md:border-r md:pb-0"
    >
      <Link
        href="/dashboard"
        aria-label="LinkNest, your page"
        className="hidden h-14 items-center justify-center border-b border-rule md:flex"
      >
        <Mark className="size-7" />
      </Link>
      <ul className="flex flex-1 md:flex-none md:flex-col md:py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "type-micro relative flex h-14 flex-col items-center justify-center gap-1 transition-colors duration-150 ease-press -outline-offset-2",
                  active ? "font-extrabold text-ink" : "font-medium text-ink-soft hover:bg-tint hover:text-ink"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bg-pink transition-transform duration-200 ease-press inset-x-3 top-0 h-[3px] origin-center md:inset-x-auto md:inset-y-2.5 md:left-0 md:h-auto md:w-[3px]",
                    active ? "scale-100" : "scale-0"
                  )}
                />
                <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
