import mongoose, { Schema, Document } from "mongoose"

export interface IUserDocument extends Document {
  email: string
  passwordHash: string
  username: string
  name?: string
  avatarUrl?: string
  plan: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    name: { type: String, trim: true, maxlength: 60 },
    avatarUrl: { type: String },
    plan: { type: String, default: "free", enum: ["free", "pro"] },
  },
  { timestamps: true }
)

userSchema.index({ username: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })

export const User = mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema)
