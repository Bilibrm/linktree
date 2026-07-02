import { Schema, Document, model, models } from "mongoose"

export interface IClickEventDocument extends Document {
  blockId: string
  pageId: string
  timestamp: Date
  referrer?: string
}

const clickEventSchema = new Schema({
  blockId: { type: String, required: true, index: true },
  pageId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: null },
})

clickEventSchema.index({ pageId: 1, timestamp: -1 })
clickEventSchema.index({ blockId: 1, timestamp: -1 })
clickEventSchema.index({ timestamp: -1 })

export const ClickEvent = models.ClickEvent || model<IClickEventDocument>("ClickEvent", clickEventSchema)
