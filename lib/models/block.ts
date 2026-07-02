import mongoose, { Schema, Document } from "mongoose"

export interface IBlockDocument extends Document {
  pageId: mongoose.Types.ObjectId
  type: string
  order: number
  data: Record<string, unknown>
  startAt?: Date | null
  endAt?: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const blockSchema = new Schema<IBlockDocument>(
  {
    pageId: { type: Schema.Types.ObjectId, ref: "Page", required: true, index: true },
    type: { type: String, required: true, enum: ["link", "header", "text", "divider", "social", "image", "gallery", "embed", "form", "countdown"] },
    order: { type: Number, required: true, default: 0 },
    data: { type: Schema.Types.Mixed, default: {} },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

blockSchema.index({ pageId: 1, order: 1 })
blockSchema.index({ pageId: 1, isActive: 1, startAt: 1, endAt: 1 })

export const Block = mongoose.models.Block || mongoose.model<IBlockDocument>("Block", blockSchema)
