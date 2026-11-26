"use client"

import { useId } from "react"
import { ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Inspector pieces for the Look panel (DESIGN_SYSTEM.md §8.5). Plain native controls:
 * radios for every choice, so arrow keys work and screen readers name the group.
 */

/** One collapsible group: title, what it is set to now, and "Reset to theme" when changed. */
export function LookGroup({
  title,
  summary,
  changed,
  onReset,
  open,
  onToggle,
  children,
}: {
  title: string
  summary: string
  changed?: boolean
  onReset?: () => void
  open?: boolean
  onToggle?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <details
      open={open}
      onToggle={(event) => onToggle?.((event.currentTarget as HTMLDetailsElement).open)}
      className="group/look border-b border-rule"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-2 transition-colors duration-150 ease-press hover:bg-tint [&::-webkit-details-marker]:hidden">
        <span className="type-title-3 text-ink">{title}</span>
        <span className="type-small ml-auto min-w-0 truncate font-normal text-ink-soft">
          {changed && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-pink align-middle" aria-hidden="true" />}
          {summary}
          {changed && <span className="sr-only">, changed from the theme</span>}
        </span>
        <ChevronDown className="size-[18px] shrink-0 text-ink transition-transform duration-200 ease-press group-open/look:rotate-180" strokeWidth={1.75} aria-hidden="true" />
      </summary>
      <div className="space-y-5 px-4 pt-1 pb-5">
        {changed && onReset && (
          <Button variant="outline" size="sm" className="h-11 md:h-8" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
            Reset {title.toLowerCase()} to the theme
          </Button>
        )}
        {children}
      </div>
    </details>
  )
}

export type ChoiceOption<T extends string> = {
  value: T
  label: string
  hint?: string
  /** Drawn above the label: a miniature of the option. */
  preview?: React.ReactNode
}

/** A labelled radio group laid out as tiles. */
export function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
  columns = 2,
  hideLegend,
}: {
  legend: string
  value: T
  options: ChoiceOption<T>[]
  onChange: (value: T) => void
  columns?: 2 | 3
  hideLegend?: boolean
}) {
  const name = useId()
  return (
    <fieldset className="min-w-0">
      <legend className={cn("type-small mb-2 font-semibold text-ink", hideLegend && "sr-only")}>{legend}</legend>
      <div className={cn("grid gap-2", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {options.map((option) => {
          const active = option.value === value
          return (
            <label key={option.value} className="group/choice relative flex min-w-0 cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="press-bare-input peer sr-only"
              />
              <span
                className={cn(
                  "flex min-h-11 w-full min-w-0 flex-col justify-center gap-1.5 rounded-label border px-2.5 py-2 text-left transition-[border-color,background-color,box-shadow] duration-150 ease-press",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink",
                  active ? "border-ink bg-sheet shadow-misregistered" : "border-rule-strong bg-sheet group-hover/choice:border-ink"
                )}
              >
                {option.preview}
                <span className={cn("type-small leading-tight text-ink", active ? "font-bold" : "font-semibold")}>{option.label}</span>
                {option.hint && <span className="type-micro font-normal text-ink-soft">{option.hint}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** A color: the native picker plus its hex value, typed or pasted. */
export function ColorField({
  label,
  value,
  onChange,
  warning,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
  warning?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="type-small mb-1.5 block font-semibold text-ink">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label}, color picker`}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-label border border-input bg-sheet p-1 md:h-9"
        />
        <input
          id={id}
          defaultValue={value}
          key={value}
          spellCheck={false}
          maxLength={7}
          onBlur={(event) => {
            const hex = event.target.value.trim()
            if (/^#[0-9a-f]{6}$/i.test(hex) && hex.toLowerCase() !== value) onChange(hex.toLowerCase())
            else event.target.value = value
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") (event.target as HTMLInputElement).blur()
          }}
          aria-describedby={warning ? `${id}-warn` : undefined}
          className="tabular h-11 w-full min-w-0 rounded-label border border-input bg-sheet px-2.5 text-base text-ink uppercase transition-colors hover:border-ink md:h-9 md:text-sm"
        />
      </div>
      {warning && (
        <p id={`${id}-warn`} className="type-small mt-1.5 font-normal text-danger-ink">
          {warning}
        </p>
      )}
    </div>
  )
}
