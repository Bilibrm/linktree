import { Schema, Document, model, models } from "mongoose"

export interface IFormSubmissionDocument extends Document {
  blockId: string
  pageId: string
  name?: string
  email?: string
  message?: string
  data?: Record<string, unknown>
  submittedAt: Date
}

const formSubmissionSchema = new Schema({
  blockId: { type: String, required: true, index: true },
  pageId: { type: String, required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
})

formSubmissionSchema.index({ blockId: 1, submittedAt: -1 })
formSubmissionSchema.index({ pageId: 1, submittedAt: -1 })

export const FormSubmission = models.FormSubmission || model<IFormSubmissionDocument>("FormSubmission", formSubmissionSchema)
