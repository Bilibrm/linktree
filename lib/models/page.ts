import mongoose, { Schema, Document } from "mongoose"

export interface IPageDocument extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  bio: string
  theme: {
    preset: string
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
