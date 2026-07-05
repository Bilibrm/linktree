"use client"

import { useState } from "react"
import { submitForm } from "@/lib/actions/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getButtonRadius, getShadowClass, getHoverClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"

export function FormBlock({ data, blockId, pageId, theme, index = 0 }: BlockComponentProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const cardRadius = getCardRadius(theme)
  const btnRadius = getButtonRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!blockId || !pageId) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const fieldData: Record<string, string> = {}
    ;(data.fields || []).forEach((field: any) => {
      fieldData[field.label] = (formData.get(field.label) as string) || ""
    })

    const submitFormData = new FormData()
    submitFormData.append("blockId", blockId)
    submitFormData.append("pageId", pageId)
    submitFormData.append("data", JSON.stringify(fieldData))

    const result: any = await submitForm(submitFormData)
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
      <div className={`${cardRadius} ${shadow} border p-6 text-center`} style={{ borderColor: "var(--page-accent)", opacity: 0.9 } as React.CSSProperties}>
        <p className="text-sm font-semibold" style={{ color: "var(--page-accent)" }}>Thank you!</p>
        <p className="text-xs mt-1" style={{ color: "var(--page-accent)", opacity: 0.6 }}>Your submission has been received.</p>
      </div>
    )
  }

  const fields = data.fields || []

  return (
    <div className={`${cardRadius} ${shadow} border p-4 ${anim}`} style={{ borderColor: "var(--page-accent)", ...delayStyle } as React.CSSProperties}>
      {data.title && <h3 className="text-sm font-semibold mb-3 text-center" style={{ color: "var(--page-accent)" }}>{data.title}</h3>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field: any, i: number) => (
          <div key={i} className="space-y-1">
            <Label className="text-xs" style={{ color: "var(--page-accent)", opacity: 0.7 }}>
              {field.label}
              {field.required && <span className="text-coral ml-0.5">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea name={field.label} required={field.required} rows={3} />
            ) : (
              <Input name={field.label} type={field.type === "email" ? "email" : "text"} required={field.required} />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: "var(--page-button-bg)", color: "var(--page-button-text)" }}
          className={`w-full ${btnRadius} py-2.5 text-sm font-semibold disabled:opacity-50 ${getHoverClass(theme)}`}
        >
          {loading ? "Sending..." : data.buttonText || "Submit"}
        </button>
      </form>
    </div>
  )
}
