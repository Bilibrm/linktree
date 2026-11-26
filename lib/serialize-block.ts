import type mongoose from "mongoose"
import type { FlatBlockData } from "@/lib/validation"
import type { BlockType, IBlock, ThemeConfig } from "@/types"
import type { IPageDocument } from "@/lib/models/page"

export type LeanBlockDoc = {
  _id: mongoose.Types.ObjectId
  pageId: mongoose.Types.ObjectId
  type: string
  order: number
  data?: Record<string, unknown> | null
  startAt?: Date | null
  endAt?: Date | null
  isActive: boolean
}

export function serializeBlockLean(b: LeanBlockDoc): IBlock {
  return {
    _id: b._id.toString(),
    pageId: b.pageId.toString(),
    type: b.type as BlockType,
    order: b.order,
    // Mongoose drops an empty `data` object on save (a divider has none), so it can come back undefined.
    data: (b.data ?? {}) as FlatBlockData,
    startAt: b.startAt?.toISOString() ?? null,
    endAt: b.endAt?.toISOString() ?? null,
    isActive: b.isActive,
  }
}

export function pageThemeToConfig(theme: IPageDocument["theme"]): ThemeConfig {
  return theme as ThemeConfig
}
