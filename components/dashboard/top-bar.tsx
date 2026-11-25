"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { AlertTriangle, Check, Copy, ExternalLink, Loader2, LogOut, Moon, MoreHorizontal, QrCode, Sun } from "lucide-react"
import { logoutAction } from "@/lib/actions/auth"
import { SITE_HOST, pageAddress, pageUrl } from "@/lib/site"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDashboardTheme } from "./theme-provider"
import { useSaveState } from "./save-state"

const barButton = "size-11 md:h-9 md:w-auto md:px-2.5"

/** Top bar (§8.3): where the page lives, three ways to share it, and whether edits are saved. */
export function DashboardTopBar({ username }: { username: string }) {
  const pathname = usePathname()
  const { dark, toggle } = useDashboardTheme()
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const url = pageUrl(username)

  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    },
    []
  )

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-rule bg-sheet pr-2 pl-4 md:gap-2 md:pr-3">
      <p className="type-small tabular min-w-0 truncate font-semibold text-ink" title={pageAddress(username)}>
        <span className="max-sm:hidden">{SITE_HOST}</span>/{username}
      </p>

      <div className="flex shrink-0 items-center md:gap-1">
        <Button variant="ghost" className={barButton} onClick={copyLink} aria-label="Copy link">
          {copied ? (
            <Check key="done" className="press-tick size-[18px]" strokeWidth={2.25} aria-hidden="true" />
          ) : (
            <Copy className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          )}
          <span className="hidden md:inline" aria-hidden="true">
            {copied ? "Copied" : "Copy"}
          </span>
        </Button>
        <span className="sr-only" role="status">
          {copied ? "Link copied" : ""}
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className={barButton} aria-label="Show QR code">
              <QrCode className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden md:inline" aria-hidden="true">
                QR
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto items-center gap-3 p-4">
            <div className="rounded-label bg-white p-3 text-on-pink">
              <QRCodeSVG
                value={url}
                size={168}
                level="M"
                bgColor="transparent"
                fgColor="currentColor"
                title={`QR code for ${pageAddress(username)}`}
              />
            </div>
            <p className="type-small max-w-[192px] text-center text-ink-soft">
              Scan to open your page. Print it on a flyer or a card.
            </p>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" className={barButton} asChild>
          <a href={`/${username}`} target="_blank" rel="noopener noreferrer" aria-label="Open your page in a new tab">
            <ExternalLink className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden md:inline" aria-hidden="true">
              Open
            </span>
          </a>
        </Button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
        {(pathname === "/dashboard" || pathname === "/dashboard/appearance") && <SaveIndicator />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-11 md:size-9" aria-label="Account menu">
              <MoreHorizontal className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onSelect={toggle} className="min-h-11 md:min-h-8">
              {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              {dark ? "Use light mode" : "Use dark mode"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void logoutAction()} className="min-h-11 md:min-h-8">
              <LogOut aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

/** "Saving…" / "Saved" / "Not saved — Retry", from the editor's and Look panel's real autosave. */
function SaveIndicator() {
  const { status, retry } = useSaveState()

  return (
    <div className="type-small flex items-center gap-1.5 text-ink-soft" data-save-state={status}>
      <span role="status" className="flex items-center gap-1.5">
        {status === "saving" && (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={2} aria-hidden="true" />
            <span className="max-sm:sr-only">Saving…</span>
          </>
        )}
        {status === "saved" && (
          <>
            <Check key="saved" className="press-tick size-4 text-ink" strokeWidth={2.5} aria-hidden="true" />
            <span className="max-sm:sr-only">Saved</span>
          </>
        )}
        {status === "error" && (
          <>
            <AlertTriangle className="size-4 text-danger-ink" strokeWidth={2} aria-hidden="true" />
            <span className="font-semibold text-danger-ink">Not saved —</span>
          </>
        )}
      </span>
      {status === "error" && (
        <button
          type="button"
          onClick={retry}
          className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4 md:min-h-9"
        >
          Retry
        </button>
      )}
    </div>
  )
}
