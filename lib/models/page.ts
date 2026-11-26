import mongoose, { Schema, Document } from "mongoose"
import type { ThemeV2 } from "@/lib/themes/types"

export interface IPageDocument extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  bio: string
  theme: {
    preset: string
    v2?: ThemeV2
    backgroundColor?: string
    backgroundType?: string
    backgroundValue?: string
    backgroundDirection?: string
    backgroundStops?: { color: string; position: number }[]
    font?: string
    buttonStyle?: string
    buttonColor?: string
    buttonTextColor?: string
    accentColor?: string
    linkStyle?: string
    linkHover?: string
    socialIconStyle?: string
    borderRadius?: string
    shadow?: string
    avatarShape?: string
    layoutWidth?: string
    animation?: string
    backgroundBlur?: boolean
    spacingDensity?: string
    customCSS?: string
  }
  seo: {
    title?: string
    description?: string
    ogImageUrl?: string
  }
  isPublished: boolean
  visibility: "public" | "unlisted" | "password"
  passwordHash?: string
  createdAt: Date
  updatedAt: Date
}

const pageSchema = new Schema<IPageDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "", maxlength: 100 },
    bio: { type: String, default: "", maxlength: 500 },
    theme: {
      preset: { type: String, default: "minimal" },
      // Theme system v2: the theme id and the layers the owner changed. No defaults on
      // purpose: a document without `v2.theme` is a v1 page and is read as one.
      v2: {
        theme: { type: String },
        palette: {
          background: { type: String },
          surface: { type: String },
          text: { type: String },
          accent: { type: String },
          accentText: { type: String },
        },
        font: { type: String },
        layout: { type: String },
        width: { type: String },
        density: { type: String },
        avatar: { type: String },
        blockStyle: { type: String },
        shape: { type: String },
        background: {
          kind: { type: String },
          ink: { type: String },
          image: { type: String },
        },
        motion: {
          entrance: { type: String },
          hover: { type: String },
        },
      },
      backgroundColor: { type: String },
      backgroundType: { type: String, default: "solid" },
      backgroundValue: { type: String },
      backgroundDirection: { type: String, default: "135deg" },
      backgroundStops: [{ color: String, position: Number }],
      font: { type: String },
      buttonStyle: { type: String, default: "rounded" },
      buttonColor: { type: String },
      buttonTextColor: { type: String },
      accentColor: { type: String },
      linkStyle: { type: String, default: "standard" },
      linkHover: { type: String, default: "lift" },
      socialIconStyle: { type: String, default: "outline" },
      borderRadius: { type: String, default: "soft" },
      shadow: { type: String, default: "subtle" },
      avatarShape: { type: String, default: "circle" },
      layoutWidth: { type: String, default: "normal" },
      animation: { type: String, default: "fade" },
      backgroundBlur: { type: Boolean, default: false },
      spacingDensity: { type: String, default: "comfortable" },
      customCSS: { type: String, default: "" },
    },
    seo: {
      title: { type: String, maxlength: 120 },
      description: { type: String, maxlength: 320 },
      ogImageUrl: { type: String },
    },
    isPublished: { type: Boolean, default: true },
    visibility: { type: String, enum: ["public", "unlisted", "password"], default: "public" },
    passwordHash: { type: String },
  },
  { timestamps: true }
)

pageSchema.index({ userId: 1 }, { unique: true })

export const Page = mongoose.models.Page || mongoose.model<IPageDocument>("Page", pageSchema)
