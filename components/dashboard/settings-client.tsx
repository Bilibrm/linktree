"use client"

import { useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Camera, Loader2, LogOut, Trash2 } from "lucide-react"
import { SITE_HOST } from "@/lib/site"
import { updateMyPage, updateMyProfile } from "@/lib/actions/page"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { logoutAction } from "@/lib/actions/auth"
import { deleteMyAccount } from "@/lib/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import type { IUser, IPage } from "@/types"

/** Inlined at build: whether this deployment can take photo uploads at all. */
const UPLOADS_READY = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

const label = "type-small font-semibold text-ink"
const help = "type-small text-ink-soft"
const field = "h-11 rounded-label border-rule-strong bg-sheet text-base md:text-sm"

function Section({ id, title, lead, children, tone }: { id: string; title: string; lead: string; children: React.ReactNode; tone?: "danger" }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-rule py-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 id={id} className={cn("type-title-2", tone === "danger" && "text-danger-ink")}>
          {title}
        </h2>
        <p className={cn(help, "mt-2 max-w-[32ch]")}>{lead}</p>
      </div>
      <div className="grid min-w-0 gap-6">{children}</div>
    </section>
  )
}

function Field({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={label}>
        {title}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className={help}>
          {hint}
        </p>
      )}
    </div>
  )
}

/**
 * Settings (DESIGN_SYSTEM.md §8.7): a plain sectioned form. Profile is how the page
 * introduces you; Account is where it lives and who can open it; Danger zone deletes
 * everything, after you type your username. One Save button covers the first two.
 */
export function SettingsClient({
  user,
  page,
}: {
  user: Pick<IUser, "email" | "username" | "name" | "avatarUrl" | "plan"> & { _id: string }
  page: Pick<IPage, "title" | "bio" | "seo" | "isPublished" | "visibility"> & { _id: string; hasPassword: boolean }
}) {
  const router = useRouter()
  const [name, setName] = useState(user.name || "")
  const [title, setTitle] = useState(page.title || "")
  const [bio, setBio] = useState(page.bio || "")
  const [seoTitle, setSeoTitle] = useState(page.seo?.title || "")
  const [seoDesc, setSeoDesc] = useState(page.seo?.description || "")
  const [isPublished, setIsPublished] = useState(page.isPublished)
  const [visibility, setVisibility] = useState(page.visibility || "public")
  const [pagePassword, setPagePassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(UPLOADS_READY ? "" : "Photo uploads are not set up on this LinkNest yet, so your page shows your initial instead.")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadId = useId()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    if (visibility === "password" && !pagePassword && !page.hasPassword) {
      setFormError("Set a password for visitors, or choose another option under Who can see it.")
      return
    }
    setSaving(true)
    const pageForm = new FormData()
    pageForm.append("title", title)
    pageForm.append("bio", bio)
    pageForm.append("isPublished", String(isPublished))
    pageForm.append("visibility", visibility)
    if (visibility === "password" && pagePassword) pageForm.append("password", pagePassword)
    pageForm.append("seo", JSON.stringify({ title: seoTitle, description: seoDesc }))
    const profileForm = new FormData()
    profileForm.append("name", name)
    profileForm.append("avatarUrl", avatarUrl)

    try {
      const [pageResult, profileResult] = await Promise.all([updateMyPage(pageForm), updateMyProfile(profileForm)])
      if (pageResult?.error || profileResult?.error) {
        setFormError("Some settings could not be saved. Check the fields above and try again.")
      } else {
        setPagePassword("")
        toast.success("Settings saved")
        router.refresh()
      }
    } catch {
      setFormError("Settings could not be saved. Check your connection and try again.")
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadError("")
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("That photo is over 5 MB. Pick a smaller one.")
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const result = await uploadToCloudinary(formData)
      if (result?.url) {
        setAvatarUrl(result.url)
        const profileForm = new FormData()
        profileForm.append("name", name)
        profileForm.append("avatarUrl", result.url)
        await updateMyProfile(profileForm)
        toast.success("Photo updated")
      } else if (result?.error === "Cloudinary not configured") {
        setUploadError("Photo uploads are not set up on this LinkNest yet, so your page shows your initial instead.")
      } else {
        setUploadError("The photo could not be uploaded. Try a JPG or PNG under 5 MB.")
      }
    } catch {
      setUploadError("The photo could not be uploaded. Check your connection and try again.")
    }
    setUploading(false)
  }

  const initial = (user.name || user.username || "?").charAt(0).toUpperCase()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="type-title-1">Settings</h1>
      <p className={cn(help, "mt-2")}>Your profile, your account, and where your page lives.</p>

      <form onSubmit={handleSave} className="mt-10" noValidate>
        <Section id="profile-title" title="Profile" lead="How your page introduces you. Shown at the top of your page.">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rule-strong bg-tint text-2xl font-bold text-ink">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- owner-supplied avatar URL; its host is not guaranteed to be in next.config remotePatterns
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <span aria-hidden="true">{initial}</span>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-4"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || !UPLOADS_READY}
                  aria-describedby={uploadError ? uploadId : undefined}
                >
                  {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Camera aria-hidden="true" />}
                  {uploading ? "Uploading" : avatarUrl ? "Change photo" : "Upload a photo"}
                </Button>
                {avatarUrl && (
                  <Button type="button" variant="ghost" className="h-11 px-4" onClick={() => setAvatarUrl("")}>
                    Remove photo
                  </Button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} tabIndex={-1} aria-hidden="true" />
              {uploadError ? (
                <p id={uploadId} className="type-small max-w-[44ch] text-ink" role="status">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sun align-middle ring-1 ring-ink" aria-hidden="true" />
                  {uploadError}
                </p>
              ) : (
                <p className={help}>JPG or PNG, up to 5 MB. Square works best.</p>
              )}
            </div>
          </div>

          <Field id="name" title="Display name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={field} />
          </Field>
          <Field id="title" title="Page title" hint="A short line under your name, like what you do.">
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className={field} aria-describedby="title-hint" />
          </Field>
          <Field id="bio" title="Bio">
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} className={cn(field, "h-auto resize-none py-2")} />
          </Field>

          <fieldset className="grid gap-6 rounded-panel border border-rule p-5">
            <legend className="type-title-3 px-1">In search results and link previews</legend>
            <Field id="seoTitle" title="Meta title" hint="Leave empty to use your name.">
              <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={120} className={field} aria-describedby="seoTitle-hint" />
            </Field>
            <Field id="seoDesc" title="Meta description" hint="Leave empty to use your bio.">
              <Textarea id="seoDesc" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} maxLength={320} className={cn(field, "h-auto resize-none py-2")} aria-describedby="seoDesc-hint" />
            </Field>
          </fieldset>
        </Section>

        <Section id="account-title" title="Account" lead="Where your page lives and who can open it.">
          <div className="grid gap-2">
            <p className={label}>Your page address</p>
            <p className="type-body tabular rounded-label border border-rule bg-tint px-3 py-2.5 text-ink">
              {SITE_HOST}/<span className="font-semibold">{user.username}</span>
            </p>
            <p className={help}>Signed in as {user.email}. Your address and email cannot be changed here yet.</p>
          </div>

          <div className="flex items-start gap-3">
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} className="mt-0.5" aria-describedby="published-hint" />
            <div className="grid gap-1">
              <label htmlFor="published" className={label}>
                Page published
              </label>
              <p id="published-hint" className={help}>
                {isPublished ? "Anyone with the address can open it." : "Turned off, the address shows a not found page."}
              </p>
            </div>
          </div>

          <Field id="visibility" title="Who can see it">
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              className={cn(field, "w-full border px-3 text-ink")}
            >
              <option value="public">Everyone, and search engines can list it</option>
              <option value="unlisted">Anyone with the link, hidden from search</option>
              <option value="password">Only people with a password</option>
            </select>
          </Field>
          {visibility === "password" && (
            <Field
              id="page-password"
              title={page.hasPassword ? "New password (leave empty to keep the current one)" : "Password for visitors"}
              hint="Visitors type it once; their browser keeps the page open for 12 hours."
            >
              <Input
                id="page-password"
                type="password"
                autoComplete="new-password"
                value={pagePassword}
                onChange={(e) => setPagePassword(e.target.value)}
                maxLength={128}
                className={field}
                aria-describedby="page-password-hint"
              />
            </Field>
          )}

          <div>
            <Button type="button" variant="outline" className="h-11 px-4" onClick={() => setShowLogoutConfirm(true)}>
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-4 border-t border-rule bg-paper px-4 py-4 md:-mx-8 md:px-8">
          <Button type="submit" variant="pink" size="touch" disabled={saving}>
            {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {saving ? "Saving" : "Save settings"}
          </Button>
          {formError && (
            <p className="type-small text-danger-ink" role="alert">
              {formError}
            </p>
          )}
        </div>
      </form>

      <DangerZone username={user.username} />

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Log out?"
        description="You will need your email and password to manage your page again."
        confirmLabel="Log out"
        onConfirm={async () => {
          await logoutAction()
        }}
      />
    </div>
  )
}

function DangerZone({ username }: { username: string }) {
  const [typed, setTyped] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const matches = typed.trim().toLowerCase() === username.toLowerCase()

  async function remove(e: React.FormEvent) {
    e.preventDefault()
    if (!matches) return
    setDeleting(true)
    setError("")
    try {
      const result = await deleteMyAccount(typed)
      if (result?.error) setError(result.error)
    } catch (err) {
      // signOut redirects by throwing; anything else is a real failure.
      if (!(err instanceof Error && err.message === "NEXT_REDIRECT")) setError("Your account could not be deleted. Try again.")
    }
    setDeleting(false)
  }

  return (
    <form onSubmit={remove} className="mt-6">
      <Section id="danger-title" title="Danger zone" lead="Deleting cannot be undone." tone="danger">
        <div className="grid gap-4 rounded-panel border border-danger p-5">
          <div>
            <p className="type-title-3">Delete your account</p>
            <p className={cn(help, "mt-1 max-w-[56ch]")}>
              Removes your page, every block, your stats and form answers, and frees the name {username} for someone else.
            </p>
          </div>
          <Field id="confirm-username" title={`Type ${username} to confirm`}>
            <Input
              id="confirm-username"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className={cn(field, "max-w-sm")}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="destructive" size="touch" disabled={!matches || deleting}>
              {deleting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
              {deleting ? "Deleting" : "Delete my account"}
            </Button>
            {error && (
              <p className="type-small text-danger-ink" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </Section>
    </form>
  )
}
