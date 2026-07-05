"use client"

import { useState } from "react"
import { submitForm } from "@/lib/actions/form"
import { toast } from "sonner"
import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getButtonRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle, getSurfaceStyle } from "@/lib/theme-utils"
import { Send, Check, Loader2 } from "lucide-react"

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
    background: `color-mix(in srgb, ${accent} 4%, transparent)`,
    borderColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
    color: "var(--page-accent)",
    ["--input-focus-border" as string]: `color-mix(in srgb, ${accent} 40%, transparent)`,
  } as React.CSSProperties
  const inputClass = "themed-input w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none placeholder:opacity-35 transition-shadow focus:ring-2"

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
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: "var(--page-accent)", color: "var(--page-button-text)" }}
        >
          <Check className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>Thank you!</p>
        <p className="text-xs mt-1" style={{ color: "var(--page-accent)", opacity: 0.55 }}>Your submission has been received.</p>
      </div>
    )
  }

  const fields: FormField[] = data.fields || []

  return (
    <div className={`${cardRadius} ${shadow} border theme-surface p-5 ${anim}`} style={{ ...getSurfaceStyle(theme), ...delayStyle } as React.CSSProperties}>
      {data.title && (
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
            <Send className="w-3 h-3" style={{ color: accent }} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>{data.title}</h3>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field, i) => (
          <div key={i} className="space-y-1">
            <label className="text-xs block font-medium" style={{ color: "var(--page-accent)", opacity: 0.65 }}>
              {field.label}
              {field.required && <span className="ml-0.5" style={{ color: accent }}>*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                name={field.label}
                required={field.required}
                rows={3}
                style={inputStyle}
                className={`${inputClass} resize-none`}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${accent}30` }}
                onBlur={(e) => { e.target.style.boxShadow = "none" }}
              />
            ) : (
              <input
                name={field.label}
                type={field.type === "email" ? "email" : "text"}
                required={field.required}
                style={inputStyle}
                className={inputClass}
                onFocus={(e) => { e.target.style.boxShadow = `0 0 0 2px ${accent}30` }}
                onBlur={(e) => { e.target.style.boxShadow = "none" }}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }}
          className={`tile-shine group relative w-full ${btnRadius} py-2.5 text-sm font-semibold disabled:opacity-50 overflow-hidden flex items-center justify-center gap-2 ${getHoverClass(theme)}`}
        >
          <span className="relative z-[2]">{loading ? "Sending..." : data.buttonText || "Submit"}</span>
          {loading ? (
            <Loader2 className="relative z-[2] w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="relative z-[2] w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </form>
    </div>
  )
}
