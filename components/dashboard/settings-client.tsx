"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateMyPage, updateMyProfile } from "@/lib/actions/page"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { logoutAction } from "@/lib/actions/auth"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Camera, Loader2, LogOut } from "lucide-react"
import type { IUser, IPage } from "@/types"

export function SettingsClient({
  user,
  page,
}: {
  user: Pick<IUser, "email" | "username" | "name" | "avatarUrl" | "plan"> & { _id: string }
  page: Pick<IPage, "title" | "bio" | "seo" | "isPublished"> & { _id: string }
}) {
  const router = useRouter()
  const [title, setTitle] = useState(page.title || "")
  const [bio, setBio] = useState(page.bio || "")
  const [name, setName] = useState(user.name || "")
  const [seoTitle, setSeoTitle] = useState(page.seo?.title || "")
  const [seoDesc, setSeoDesc] = useState(page.seo?.description || "")
  const [isPublished, setIsPublished] = useState(page.isPublished)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSavePage(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("bio", bio)
    formData.append("isPublished", String(isPublished))
    formData.append("seo", JSON.stringify({ title: seoTitle, description: seoDesc }))

    const result: any = await updateMyPage(formData)
    if (result?.error) toast.error("Failed to save")
    else {
      toast.success("Settings saved!")
      router.refresh()
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const result: any = await uploadToCloudinary(formData)
    if (result?.url) {
      setAvatarUrl(result.url)
      const profileForm = new FormData()
      profileForm.append("name", name)
      profileForm.append("avatarUrl", result.url)
      await updateMyProfile(profileForm)
      toast.success("Avatar updated!")
    } else {
      toast.error("Upload failed")
    }
    setUploading(false)
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", name)
    if (avatarUrl) formData.append("avatarUrl", avatarUrl)
    const result: any = await updateMyProfile(formData)
    if (result?.error) toast.error("Failed to update profile")
    else toast.success("Profile updated!")
  }

  const inputClass = "h-10 bg-ink border-white/5 text-bone text-caption focus:border-gold/50 focus:ring-gold/20"

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-display font-bold text-bone">Settings</h1>
        <p className="text-caption text-muted-foreground mt-0.5">Your page and account.</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-white/5 bg-surface/30 p-5 md:p-6">
        <h2 className="text-heading font-semibold text-bone mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-ink border border-white/5 overflow-hidden flex items-center justify-center text-display font-bold text-muted-foreground">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user.name || user.username || "U")[0].toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="text-caption font-medium text-bone">{user.name || user.username}</p>
              <p className="text-small text-muted-foreground">Click to upload photo</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-small text-muted-foreground">Email</label>
            <Input value={user.email} disabled className={`${inputClass} opacity-50`} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-small text-muted-foreground">Display name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-small text-muted-foreground">Username</label>
            <Input value={`linknest.app/${user.username}`} disabled className={`${inputClass} opacity-50 font-mono`} />
          </div>
          <button type="submit" disabled={saving} className="h-10 rounded-xl bg-gold text-ink text-caption font-semibold px-5 hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save profile
          </button>
        </form>
      </div>

      {/* Page Settings */}
      <div className="rounded-xl border border-white/5 bg-surface/30 p-5 md:p-6">
        <h2 className="text-heading font-semibold text-bone mb-4">Page</h2>
        <form onSubmit={handleSavePage} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-small text-muted-foreground">Page title</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-small text-muted-foreground">Bio</label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
            <label htmlFor="published" className="text-caption text-bone">Page published</label>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-caption font-semibold text-bone mb-3">SEO</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="seoTitle" className="text-small text-muted-foreground">Meta title</label>
                <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={120} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="seoDesc" className="text-small text-muted-foreground">Meta description</label>
                <Textarea id="seoDesc" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} maxLength={320} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving} className="h-10 rounded-xl bg-gold text-ink text-caption font-semibold px-5 hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="rounded-xl border border-coral/20 bg-coral/5 p-5 md:p-6">
        <h2 className="text-heading font-semibold text-bone mb-2">Log out</h2>
        <p className="text-caption text-muted-foreground mb-4">Sign out of your account.</p>
        <form action={logoutAction}>
          <button type="submit" className="h-10 rounded-xl border border-coral/30 text-coral text-caption font-semibold px-5 hover:bg-coral/10 transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}
