"use client"

import { useId, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { submitForm } from "@/lib/actions/form"
import type { BlockComponentProps } from "./block-props"

type FormField = { label: string; type?: string; required?: boolean }

/** Client island: a visitor fills it in and it posts to the owner's inbox. */
export function FormBlock({ data, blockId, pageId }: BlockComponentProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const uid = useId()
  const fields = ((data.fields || []) as FormField[]).filter((f) => f && f.label)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Samples (landing, picker proofs) have no page to send to.
    if (!blockId || !pageId) return
    setState("sending")
    const formData = new FormData(event.currentTarget)
    const answers: Record<string, string> = {}
    fields.forEach((field, i) => {
      answers[field.label] = String(formData.get(`f${i}`) ?? "")
    })
    const submit = new FormData()
    submit.append("blockId", blockId)
    submit.append("pageId", pageId)
    submit.append("data", JSON.stringify(answers))
    try {
      const result = (await submitForm(submit)) as { error?: string } | undefined
      setState(result?.error ? "error" : "sent")
    } catch {
      setState("error")
    }
  }

  if (state === "sent") {
    return (
      <div className="lp-card" role="status">
        <p className="lp-card-title">
          <Check className="mr-2 inline size-5 align-[-3px]" aria-hidden="true" />
          Sent. Thank you.
        </p>
        <p className="lp-card-note">Your answer reached {data.title ? `“${data.title}”` : "the owner of this page"}.</p>
      </div>
    )
  }

  return (
    <div className="lp-card">
      {data.title && <h2 className="lp-card-title">{data.title}</h2>}
      <form onSubmit={handleSubmit} className="lp-form">
        {fields.map((field, i) => {
          const id = `${uid}-f${i}`
          return (
            <div key={i}>
              <label htmlFor={id} className="lp-label">
                {field.label}
                {field.required ? "" : " (optional)"}
              </label>
              {field.type === "textarea" ? (
                <textarea id={id} name={`f${i}`} required={field.required} rows={3} className="lp-input" />
              ) : (
                <input
                  id={id}
                  name={`f${i}`}
                  type={field.type === "email" ? "email" : "text"}
                  autoComplete={field.type === "email" ? "email" : "off"}
                  required={field.required}
                  className="lp-input"
                />
              )}
            </div>
          )
        })}
        <button type="submit" className="lp-btn" data-variant="primary" disabled={state === "sending"}>
          {state === "sending" && <Loader2 className="animate-spin" aria-hidden="true" />}
          {state === "sending" ? "Sending" : data.buttonText || "Send"}
        </button>
        {state === "error" && (
          <p className="lp-error" role="alert">
            That did not send. Check your connection and try again.
          </p>
        )}
      </form>
    </div>
  )
}
