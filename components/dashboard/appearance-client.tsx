"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateMyPage } from "@/lib/actions/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { PublicPreview } from "@/components/blocks/public-preview"
import type { IBlock, ThemeConfig, ThemePreset } from "@/types"

const presets: { name: ThemePreset; label: string; colors: { bg: string; accent: string; btn: string; text: string } }[] = [
  { name: "minimal", label: "Minimal", colors: { bg: "#ffffff", accent: "#000000", btn: "#000000", text: "#ffffff" } },
  { name: "dark", label: "Dark", colors: { bg: "#0a0a0a", accent: "#ffffff", btn: "#ffffff", text: "#0a0a0a" } },
  { name: "vibrant", label: "Vibrant", colors: { bg: "#f0f0ff", accent: "#6366f1", btn: "#6366f1", text: "#ffffff" } },
  { name: "nature", label: "Nature", colors: { bg: "#f0fdf4", accent: "#16a34a", btn: "#16a34a", text: "#ffffff" } },
  { name: "ocean", label: "Ocean", colors: { bg: "#f0f9ff", accent: "#0284c7", btn: "#0284c7", text: "#ffffff" } },
  { name: "sunset", label: "Sunset", colors: { bg: "#fef2f2", accent: "#e11d48", btn: "#e11d48", text: "#ffffff" } },
  { name: "mono", label: "Monochrome", colors: { bg: "#fafafa", accent: "#525252", btn: "#525252", text: "#fafafa" } },
  { name: "bold", label: "Bold", colors: { bg: "#000000", accent: "#facc15", btn: "#facc15", text: "#000000" } },
]

const fontPairs = [
  { value: "geist-inter", label: "Geist + Inter", display: "Geist", body: "Inter" },
  { value: "fraunces-publicsans", label: "Fraunces + Public Sans", display: "Fraunces", body: "Public Sans" },
  { value: "dm-sans", label: "DM Sans pair", display: "DM Sans", body: "DM Sans" },
  { value: "space-mono", label: "Space Grotesk + Mono", display: "Space Grotesk", body: "JetBrains Mono" },
  { value: "serif-sans", label: "Playfair + Inter", display: "Playfair Display", body: "Inter" },
]

const buttonStyles = [
  { value: "sharp", label: "Sharp" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
]

const linkStyles = [
  { value: "standard", label: "Standard" },
  { value: "card", label: "Card" },
  { value: "minimal", label: "Minimal" },
]

const linkHoverStyles = [
  { value: "lift", label: "Subtle lift" },
  { value: "underline", label: "Underline" },
  { value: "fill", label: "Fill" },
  { value: "none", label: "None" },
]

const socialIconStyles = [
  { value: "outline", label: "Outline" },
  { value: "filled", label: "Filled" },
  { value: "minimal", label: "Minimal" },
]

const borderRadiusOptions = [
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
]

const shadowOptions = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
]

const avatarShapeOptions = [
  { value: "circle", label: "Circle" },
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
]

const spacingOptions = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
]

const layoutWidthOptions = [
  { value: "narrow", label: "Narrow" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
]

const animationOptions = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide Up" },
  { value: "scale", label: "Scale" },
]

const bgDirectionOptions = [
  { value: "135deg", label: "Diagonal ↘" },
  { value: "0deg", label: "Horizontal →" },
  { value: "90deg", label: "Vertical ↓" },
  { value: "45deg", label: "Diagonal ↗" },
]

export function AppearanceClient({
  pageId,
  initialTheme,
  username,
  blocks = [],
  displayName,
  avatarUrl,
  bio,
  title,
}: {
  pageId: string
  initialTheme: ThemeConfig
  username: string
  blocks?: IBlock[]
  displayName?: string
  avatarUrl?: string
  bio?: string
  title?: string
}) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme)
  const [saving, setSaving] = useState(false)
  const [visibility, setVisibility] = useState("public")
  const [pagePassword, setPagePassword] = useState("")

  async function save() {
    setSaving(true)
    const formData = new FormData()
    formData.append("theme", JSON.stringify(theme))
    formData.append("visibility", visibility)
    if (visibility === "password" && pagePassword) {
      formData.append("password", pagePassword)
    }
    const result: any = await updateMyPage(formData)
    if (result?.error) {
      toast.error("Failed to save")
    } else {
      toast.success("Saved!")
    }
    setSaving(false)
  }

  function updateAndSave(key: keyof ThemeConfig, value: string | boolean) {
    const updated = { ...theme, [key]: value }
    setTheme(updated)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-display font-bold">Appearance</h1>
        <p className="text-caption text-muted-foreground mt-0.5">Customize the look and feel of your public page.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
      <div className="flex-1 min-w-0 w-full">
      <Tabs defaultValue="preset" className="space-y-6">
        <TabsList className="bg-surface border border-white/5">
          <TabsTrigger value="preset">Themes</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="preset" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  const updated = {
                    ...theme,
                    preset: p.name,
                    backgroundColor: p.colors.bg,
                    buttonColor: p.colors.btn,
                    buttonTextColor: p.colors.text,
                    accentColor: p.colors.accent,
                    backgroundType: "solid" as const,
                  }
                  setTheme(updated)
                }}
                className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-sm ${
                  theme.preset === p.name ? "border-gold" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-caption font-medium" style={{ backgroundColor: p.colors.bg, color: p.colors.accent }}>Aa</div>
                <span className="text-small font-medium text-muted-foreground">{p.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-caption">Background Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={theme.backgroundColor || "#ffffff"} onChange={(e) => updateAndSave("backgroundColor", e.target.value)} className="w-12 h-9 p-1" />
                <Input value={theme.backgroundColor || "#ffffff"} onChange={(e) => updateAndSave("backgroundColor", e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Button Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={theme.buttonColor || "#000000"} onChange={(e) => updateAndSave("buttonColor", e.target.value)} className="w-12 h-9 p-1" />
                <Input value={theme.buttonColor || "#000000"} onChange={(e) => updateAndSave("buttonColor", e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Button Text Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={theme.buttonTextColor || "#ffffff"} onChange={(e) => updateAndSave("buttonTextColor", e.target.value)} className="w-12 h-9 p-1" />
                <Input value={theme.buttonTextColor || "#ffffff"} onChange={(e) => updateAndSave("buttonTextColor", e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Accent Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={theme.accentColor || "#000000"} onChange={(e) => updateAndSave("accentColor", e.target.value)} className="w-12 h-9 p-1" />
                <Input value={theme.accentColor || "#000000"} onChange={(e) => updateAndSave("accentColor", e.target.value)} className="h-9" />
              </div>
            </div>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-3">
            <Label className="text-caption">Background Type</Label>
            <Select value={theme.backgroundType || "solid"} onValueChange={(v) => updateAndSave("backgroundType", v)}>
              <SelectTrigger className="bg-ink border-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface border-white/5">
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="image">Image (URL)</SelectItem>
                <SelectItem value="animated">Animated (subtle)</SelectItem>
              </SelectContent>
            </Select>

            {theme.backgroundType === "gradient" && (
              <div className="space-y-3 pt-2">
                <Label className="text-caption">Gradient Direction</Label>
                <Select value={theme.backgroundDirection || "135deg"} onValueChange={(v) => updateAndSave("backgroundDirection", v)}>
                  <SelectTrigger className="bg-ink border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-white/5">
                    {bgDirectionOptions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label className="text-caption">Gradient CSS (overrides picker)</Label>
                <Input
                  value={theme.backgroundValue || ""}
                  onChange={(e) => updateAndSave("backgroundValue", e.target.value)}
                  placeholder="linear-gradient(135deg, #667eea, #764ba2)"
                  className="h-9 bg-ink border-white/5"
                />
              </div>
            )}

            {theme.backgroundType === "image" && (
              <Input
                value={theme.backgroundValue || ""}
                onChange={(e) => updateAndSave("backgroundValue", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-9 bg-ink border-white/5"
              />
            )}

            {(theme.backgroundType === "gradient" || theme.backgroundType === "image") && (
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={theme.backgroundBlur || false} onCheckedChange={(v) => updateAndSave("backgroundBlur", v)} />
                <Label className="text-small text-muted-foreground">Enable backdrop blur</Label>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="styles" className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-caption">Font Pairing</Label>
              <Select value={theme.font || "geist-inter"} onValueChange={(v) => updateAndSave("font", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {fontPairs.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Button Shape</Label>
              <Select value={theme.buttonStyle || "rounded"} onValueChange={(v) => updateAndSave("buttonStyle", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {buttonStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Link Style</Label>
              <Select value={theme.linkStyle || "standard"} onValueChange={(v) => updateAndSave("linkStyle", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {linkStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Link Hover Effect</Label>
              <Select value={theme.linkHover || "lift"} onValueChange={(v) => updateAndSave("linkHover", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {linkHoverStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Social Icon Style</Label>
              <Select value={theme.socialIconStyle || "outline"} onValueChange={(v) => updateAndSave("socialIconStyle", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {socialIconStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Avatar Shape</Label>
              <Select value={theme.avatarShape || "circle"} onValueChange={(v) => updateAndSave("avatarShape", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {avatarShapeOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-caption">Border Radius</Label>
              <Select value={theme.borderRadius || "soft"} onValueChange={(v) => updateAndSave("borderRadius", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {borderRadiusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Shadow</Label>
              <Select value={theme.shadow || "subtle"} onValueChange={(v) => updateAndSave("shadow", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {shadowOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Spacing Density</Label>
              <Select value={theme.spacingDensity || "comfortable"} onValueChange={(v) => updateAndSave("spacingDensity", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {spacingOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Page Width</Label>
              <Select value={theme.layoutWidth || "normal"} onValueChange={(v) => updateAndSave("layoutWidth", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {layoutWidthOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-caption">Entrance Animation</Label>
              <Select value={theme.animation || "fade"} onValueChange={(v) => updateAndSave("animation", v)}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  {animationOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="space-y-2">
            <Label className="text-caption">Custom CSS</Label>
            <p className="text-small text-muted-foreground">Inject custom CSS rules for your public page. Advanced users only.</p>
            <textarea
              value={theme.customCSS || ""}
              onChange={(e) => updateAndSave("customCSS", e.target.value)}
              placeholder=".my-link { border: 2px solid gold; }"
              rows={6}
              className="w-full rounded-lg border border-white/5 bg-ink text-bone text-caption p-3 font-mono resize-y focus:outline-none focus:ring-1 focus:ring-gold/50"
            />
          </div>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-caption">Page Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="bg-ink border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-white/5">
                  <SelectItem value="public">Public — anyone can view</SelectItem>
                  <SelectItem value="unlisted">Unlisted — only with direct link</SelectItem>
                  <SelectItem value="password">Password protected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {visibility === "password" && (
              <div className="space-y-2">
                <Label className="text-caption">Page Password</Label>
                <Input
                  type="password"
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="Set a shared password"
                  className="h-9 bg-ink border-white/5"
                />
                <p className="text-small text-muted-foreground">Visitors will need this password to view your page.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-gold text-ink hover:bg-gold/90">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
      </div>

      <aside className="w-full xl:w-[340px] xl:sticky xl:top-6 flex-shrink-0">
        <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wider font-mono mb-3">Live Preview</h3>
        <PublicPreview
          blocks={blocks}
          username={username}
          theme={theme}
          displayName={displayName}
          avatarUrl={avatarUrl}
          bio={bio}
          title={title}
          editable
        />
        <p className="text-small text-muted-foreground mt-3 leading-relaxed">
          Updates as you change settings below. Click &ldquo;Save changes&rdquo; to publish it to your live page.
        </p>
      </aside>
      </div>
    </div>
  )
}
