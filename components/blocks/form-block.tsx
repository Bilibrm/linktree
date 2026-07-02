"use client"

import { useState } from "react"
import { submitForm } from "@/lib/actions/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function FormBlock({ data, blockId, pageId }: { data: any; blockId?: string; pageId?: string }) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm font-medium">Thank you!</p>
        <p className="text-xs text-muted-foreground mt-1">Your submission has been received.</p>
      </div>
    )
  }

  const fields = data.fields || []

  return (
    <div className="rounded-xl border bg-card p-4">
      {data.title && <h3 className="text-sm font-medium mb-3 text-center">{data.title}</h3>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field: any, i: number) => (
          <div key={i} className="space-y-1">
            <Label className="text-xs">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea name={field.label} required={field.required} rows={3} />
            ) : (
              <Input name={field.label} type={field.type === "email" ? "email" : "text"} required={field.required} />
            )}
          </div>
        ))}
        <Button type="submit" className="w-full rounded-full text-sm" size="sm" disabled={loading}>
          {loading ? "Sending..." : data.buttonText || "Submit"}
        </Button>
      </form>
    </div>
  )
}
