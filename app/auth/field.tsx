import { CircleAlert } from "lucide-react"

/** Shared input look for the auth forms: 48px tall, 16px text, never zooms on iOS. */
export const authInputClass = "h-12 px-3 text-base md:text-base"

export function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="type-small flex items-baseline justify-between font-semibold text-ink">
      <span>{children}</span>
      {hint && <span className="font-normal text-ink-soft">{hint}</span>}
    </label>
  )
}

/** Says what failed, in words, with an icon so the state never rests on color alone. */
export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="type-small flex items-start gap-1.5 text-danger-ink">
      <CircleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
