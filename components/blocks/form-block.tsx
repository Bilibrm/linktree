"use client"

import { useState } from "react"
import { submitForm } from "@/lib/actions/form"
import { toast } from "sonner"
import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getButtonRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle } from "@/lib/theme-utils"

type FormField = { label: string; type?: string; required?: boolean }

export function FormBlock({ data, blockId, pageId, theme, index = 0 }: BlockComponentProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const cardRadius = getCardRadius(theme)
  const btnRadius = getButtonRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)
  const accent = theme.accentColor || "#16302A"

  const inputStyle: React.CSSProperties = {
    background: `color-mix(in srgb, ${accent} 5%, transparent)`,
    borderColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
    color: "var(--page-accent)",
    ["--input-focus-border" as string]: `color-mix(in srgb, ${accent} 45%, transparent)`,
  } as React.CSSProperties
  const inputClass = "themed-input w-full rounded-lg border px-3 py-2 text-sm outline-none placeholder:opacity-40"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!blockId || !pageId) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const fieldData: Record<string, string> = {}
    ;(data.fields || []).forEach((field: FormField) => {
      fieldData[field.label] = (formData.get(field.label) as string) || ""
    })

    const submitFormData = new FormData()
    submitFormData.append("blockId", blockId)
    submitFormData.append("pageId", pageId)
    submitFormData.append("data", JSON.stringify(fieldData))

    const result = await submitForm(submitFormData) as { error?: string } | undefined
    if (result?.error) {
      toast.error("Failed to submit")
    } else {
      setSubmitted(true)
      toast.success("Submitted!")
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className={`${cardRadius} ${shadow} border theme-surface p-6 text-center`} style={{ ...getSurfaceStyle(theme), opacity: 0.95 } as React.CSSProperties}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 text-sm"
          style={{ backgroundColor: "var(--page-accent)", color: "var(--page-button-text)" }}
        >
          ✓
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>Thank you!</p>
        <p className="text-xs mt-1" style={{ color: "var(--page-accent)", opacity: 0.6 }}>Your submission has been received.</p>
      </div>
    )
  }

  const fields: FormField[] = data.fields || []

  return (
    <div className={`${cardRadius} ${shadow} border theme-surface p-5 ${anim}`} style={{ ...getSurfaceStyle(theme), ...delayStyle } as React.CSSProperties}>
      {data.title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>{data.title}</h3>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field, i) => (
          <div key={i} className="space-y-1">
            <label className="text-xs block" style={{ color: "var(--page-accent)", opacity: 0.7 }}>
              {field.label}
              {field.required && <span style={{ color: theme.buttonColor || "#DD5B39" }} className="ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea name={field.label} required={field.required} rows={3} style={inputStyle} className={inputClass} />
            ) : (
              <input name={field.label} type={field.type === "email" ? "email" : "text"} required={field.required} style={inputStyle} className={inputClass} />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }}
          className={`tile-shine group relative w-full ${btnRadius} py-2.5 text-sm font-semibold disabled:opacity-50 overflow-hidden flex items-center justify-center gap-1.5 ${getHoverClass(theme)}`}
        >
          <span className="relative z-[2]">{loading ? "Sending..." : data.buttonText || "Submit"}</span>
          {!loading && <span className="relative z-[2] opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>}
        </button>
      </form>
    </div>
  )
}
