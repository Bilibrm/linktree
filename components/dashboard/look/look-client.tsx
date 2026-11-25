"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { ImageUp, Loader2, Palette, Play } from "lucide-react"
import { toast } from "sonner"
import type { IBlock } from "@/types"
import {
  BACKGROUNDS,
  BLOCK_STYLES,
  DENSITIES,
  ENTRANCES,
  HOVERS,
  LAYOUTS,
  SHAPES,
  WIDTHS,
  AVATARS,
  contrast,
  draftToStored,
  fontHref,
  fontPairs,
  patchRecipe,
  pickTheme,
  pickableThemes,
  resetLayer,
  resolveTheme,
  resolveThemeId,
  themeRootProps,
  type Layer,
  type ResolvedTheme,
  type ThemeDraft,
  type ThemeV2,
} from "@/lib/themes"
import { updateMyTheme } from "@/lib/actions/page"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { PublicPreview } from "@/components/blocks/public-preview"
import { ThemeThumb } from "@/components/page/theme-thumb"
import { useThemeFonts } from "@/components/page/theme-fonts"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useSaveState } from "@/components/dashboard/save-state"
import { cn } from "@/lib/utils"
import { Choice, ColorField, LookGroup, type ChoiceOption } from "./look-controls"

const SAVE_DELAY = 600

/* Plain words for every option (DESIGN_SYSTEM.md §2: no print jargon on controls). */
const LAYOUT_LABEL: Record<(typeof LAYOUTS)[number], [string, string]> = {
  stack: ["Stack", "Centered, one column"],
  editorial: ["Editorial", "Left-aligned, big name"],
  cover: ["Cover", "A color band behind your photo"],
  grid: ["Grid", "Links as tiles, two across"],
  poster: ["Poster", "Your name as big as the page"],
}
const BLOCK_LABEL: Record<(typeof BLOCK_STYLES)[number], string> = {
  filled: "Filled",
  outline: "Outline",
  offset: "Offset shadow",
  ticket: "Ticket",
  soft: "Soft",
  underline: "Underline",
}
const SHAPE_LABEL: Record<(typeof SHAPES)[number], string> = { sharp: "Square", soft: "Slightly round", round: "Round", pill: "Pill" }
const WIDTH_LABEL: Record<(typeof WIDTHS)[number], string> = { narrow: "Narrow", normal: "Medium", wide: "Wide" }
const DENSITY_LABEL: Record<(typeof DENSITIES)[number], string> = { compact: "Tight", comfortable: "Comfortable", spacious: "Airy" }
const AVATAR_LABEL: Record<(typeof AVATARS)[number], string> = { circle: "Circle", rounded: "Rounded", square: "Square" }
const BACKGROUND_LABEL: Record<(typeof BACKGROUNDS)[number], string> = {
  flat: "Plain",
  duotone: "Two-ink fade",
  halftone: "Halftone",
  grain: "Grain",
  paper: "Paper fibers",
  grid: "Grid",
  stripes: "Stripes",
  confetti: "Speckles",
  image: "Photo",
  drift: "Drifting dots",
  blobs: "Moving shapes",
}
const ENTRANCE_LABEL: Record<(typeof ENTRANCES)[number], [string, string]> = {
  print: ["Print in", "Each block wipes in, top to bottom"],
  slide: ["Slide up", "Blocks rise into place"],
  fade: ["Fade in", "Blocks appear softly"],
  none: ["None", "Everything is there at once"],
}
const HOVER_LABEL: Record<(typeof HOVERS)[number], [string, string]> = {
  lift: ["Lift", "Rises a little"],
  offset: ["Offset shadow", "A second ink slides out"],
  fill: ["Ink fill", "Fills with ink from the left"],
  underline: ["Underline", "The label is underlined"],
  flicker: ["Flicker", "Blinks like a sign"],
  none: ["None", "Stays put"],
}

function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Restyle the proof. Discrete changes crossfade through a view transition where supported (§6.2). */
function crossfade(apply: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  if (doc.startViewTransition && motionAllowed()) doc.startViewTransition(() => flushSync(apply))
  else apply()
}

/** A tiny `.lp` root showing one option for real (a block style, a corner, a background). */
function Mini({ theme, attrs, kind }: { theme: ResolvedTheme; attrs: Record<string, string>; kind: "tile" | "background" }) {
  const root = themeRootProps(theme)
  return (
    <span
      {...root.attrs}
      data-theme="mini"
      data-layout="editorial"
      {...attrs}
      data-still=""
      className={cn("lp ln-mini", kind === "background" && "ln-mini-bg")}
      style={root.style as React.CSSProperties}
      aria-hidden="true"
    >
      {kind === "background" ? (
        <span className="lp-bg">
          <span className="lp-art lp-art-a" />
          <span className="lp-art lp-art-b" />
        </span>
      ) : (
        <span className="lp-tile">
          <span className="lp-tile-label">Link</span>
        </span>
      )}
    </span>
  )
}

/** Three of the owner's own links for the theme thumbnails, or stand-ins when there are none. */
function thumbBlocksFrom(blocks: IBlock[]): IBlock[] {
  const own = blocks.filter((b) => (b.type === "link" || b.type === "button") && (b.data.title || b.data.label)).slice(0, 3)
  if (own.length >= 2) return own.map((b) => ({ ...b, pageId: "" }))
  return ["Your first link", "Shop", "Contact"].map((title, i) => ({
    _id: `thumb-${i}`,
    pageId: "",
    type: "link",
    order: i,
    data: { title, url: "https://example.com", featured: i === 0, icon: "website" },
    isActive: true,
  }))
}

export function LookClient({
  initialDraft,
  username,
  header,
  blocks,
}: {
  initialDraft: ThemeDraft
  username: string
  header: { displayName: string; avatarUrl?: string; title?: string; bio?: string }
  blocks: IBlock[]
}) {
  const { run } = useSaveState()
  const [draft, setDraft] = useState(initialDraft)
  const draftRef = useRef(initialDraft)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [replay, setReplay] = useState(0)
  const [ambient, setAmbient] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const theme = useMemo(() => resolveTheme(draftToStored(draft)), [draft])
  const thumbs = useMemo(() => pickableThemes.map((t) => resolveThemeId(t.id)), [])
  const thumbBlocks = useMemo(() => thumbBlocksFrom(blocks), [blocks])
  const name = header.displayName || username

  /* ── fonts: thumbnails and the type list load only the glyphs they show ── */
  const thumbText = [name, ...thumbBlocks.map((b) => String(b.data.title ?? b.data.label ?? ""))].join(" ")
  useThemeFonts(thumbs.map((t) => fontHref(t.font, thumbText)))
  useThemeFonts(typeOpen ? fontPairs.map((pair) => fontHref(pair, `Aa ${pair.label}`)) : [])

  /* ── autosave ── */
  const save = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    void run("theme", async () => {
      const { v2, customCSS } = draftToStored(draftRef.current)
      const result = await updateMyTheme({ v2, customCSS })
      if (!result || !("success" in result)) throw new Error("Look not saved")
    })
  }, [run])

  useEffect(() => {
    const flush = () => timer.current && save()
    window.addEventListener("pagehide", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      flush()
    }
  }, [save])

  /** Apply a new draft. `discrete` changes crossfade; dragging a color picker does not. */
  function commit(next: ThemeDraft, discrete = true) {
    const apply = () => {
      draftRef.current = next
      setDraft(next)
    }
    if (discrete) crossfade(apply)
    else apply()
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(save, SAVE_DELAY)
  }

  const patch = (p: Partial<ThemeV2>, discrete = true) => commit(patchRecipe(draftRef.current, p), discrete)
  const reset = (layer: Layer) => commit(resetLayer(draftRef.current, layer))

  function choose(id: string) {
    if (id === theme.id && !Object.values(theme.changed).some(Boolean)) return
    const before = draftRef.current
    commit(pickTheme(before, id))
    setReplay((n) => n + 1)
    const hadChanges = Object.values(theme.changed).some(Boolean)
    const picked = pickableThemes.find((t) => t.id === id)?.name ?? "the theme"
    toast(`Theme changed to ${picked}`, {
      description: hadChanges ? "Your color, type and layout changes were replaced." : undefined,
      duration: 6000,
      action: { label: "Undo", onClick: () => commit(before) },
    })
  }

  async function uploadBackground(file: File) {
    setUploadError("")
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("That photo is over 5 MB. Pick a smaller one.")
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const result = await uploadToCloudinary(fd)
      if (result.success && result.url) patch({ background: { kind: "image", image: result.url } })
      else setUploadError("The photo didn't upload. Try again, or use a smaller file.")
    } catch {
      setUploadError("The photo didn't upload. Check your connection and try again.")
    }
    setUploading(false)
  }

  /* ── contrast, said in words (§9) ── */
  const { palette } = theme
  const warn = (a: string, b: string, what: string) => {
    const ratio = contrast(a, b)
    return ratio < 4.5 ? `${what} is hard to read (${ratio.toFixed(1)} to 1). Aim for 4.5 to 1 or more.` : undefined
  }
  const hasMovingBackground = theme.background.kind === "drift" || theme.background.kind === "blobs"
  const font = theme.font

  const options = {
    layouts: LAYOUTS.map((value): ChoiceOption<typeof value> => ({ value, label: LAYOUT_LABEL[value][0], hint: LAYOUT_LABEL[value][1] })),
    blocks: BLOCK_STYLES.map((value): ChoiceOption<typeof value> => ({
      value,
      label: BLOCK_LABEL[value],
      preview: <Mini theme={theme} attrs={{ "data-block": value }} kind="tile" />,
    })),
    shapes: SHAPES.map((value): ChoiceOption<typeof value> => ({
      value,
      label: SHAPE_LABEL[value],
      preview: <Mini theme={theme} attrs={{ "data-shape": value }} kind="tile" />,
    })),
    backgrounds: BACKGROUNDS.map((value): ChoiceOption<typeof value> => ({
      value,
      label: BACKGROUND_LABEL[value],
      preview: <Mini theme={theme} attrs={{ "data-bg": value }} kind="background" />,
    })),
  }

  return (
    <div className="md:flex md:h-full md:min-h-0">
      <div data-canvas className="min-w-0 md:flex-1 md:overflow-y-auto">
        <div className="mx-auto w-full max-w-[438px] px-4 py-6 md:py-10">
          <h1 className="sr-only">Your look</h1>
          <div style={{ viewTransitionName: "look-proof" }}>
            <PublicPreview
              blocks={blocks}
              username={username}
              displayName={name}
              avatarUrl={header.avatarUrl}
              bio={header.bio}
              title={header.title}
              theme={theme}
              still={false}
              ambient={ambient}
              replayKey={`${theme.id}:${theme.motion.entrance}:${replay}`}
              className="border-ink shadow-offset"
            />
          </div>
          <p className="type-small mt-4 text-center font-normal text-ink-soft">This is your page as visitors see it. Changes save by themselves.</p>
        </div>
      </div>

      <aside aria-label="Look" className="border-t border-rule bg-sheet md:w-[340px] md:shrink-0 md:overflow-y-auto md:border-t-0 md:border-l">
        <section data-inspector aria-labelledby="look-title">
          <header className="flex items-center gap-2.5 border-b border-rule px-4 py-3">
            <Palette className="size-[18px] shrink-0 text-ink" strokeWidth={1.75} aria-hidden="true" />
            <h2 id="look-title" className="type-title-3 text-ink">
              Look
            </h2>
            <p className="type-micro ml-auto font-medium text-ink-soft">{theme.name}</p>
          </header>

          <LookGroup title="Themes" summary={theme.name} open>
            <fieldset>
              <legend className="type-small mb-3 font-normal text-ink-soft">
                Each theme sets every layer below. Start from one, then change what you like.
              </legend>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {thumbs.map((t) => {
                  const active = t.id === theme.id
                  return (
                    <label key={t.id} className="group/theme flex cursor-pointer flex-col gap-1.5">
                      <input type="radio" name="look-theme" value={t.id} checked={active} onChange={() => choose(t.id)} className="press-bare-input peer sr-only" />
                      <span
                        className={cn(
                          "block w-fit overflow-hidden rounded-label border transition-[transform,border-color,box-shadow] duration-150 ease-press",
                          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink",
                          active ? "border-ink shadow-misregistered" : "border-rule-strong group-hover/theme:-translate-y-0.5 group-hover/theme:border-ink"
                        )}
                      >
                        <ThemeThumb theme={t} header={{ name }} blocks={thumbBlocks} width={142} />
                      </span>
                      <span className={cn("type-small leading-tight text-ink", active ? "font-bold" : "font-semibold")}>{t.name}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </LookGroup>

          <LookGroup title="Colors" summary="Five inks" changed={theme.changed.palette} onReset={() => reset("palette")}>
            <ColorField label="Page" value={palette.background} onChange={(v) => patch({ palette: { background: v } }, false)} warning={warn(palette.text, palette.background, "Text on the page")} />
            <ColorField label="Text" value={palette.text} onChange={(v) => patch({ palette: { text: v } }, false)} />
            <ColorField label="Blocks" value={palette.surface} onChange={(v) => patch({ palette: { surface: v } }, false)} />
            <ColorField label="Accent" value={palette.accent} onChange={(v) => patch({ palette: { accent: v } }, false)} warning={warn(palette.accentText, palette.accent, "Text on the accent")} />
            <ColorField label="Text on accent" value={palette.accentText} onChange={(v) => patch({ palette: { accentText: v } }, false)} />
          </LookGroup>

          <LookGroup title="Type" summary={font.label} changed={theme.changed.font} onReset={() => reset("font")} open={typeOpen} onToggle={setTypeOpen}>
            <Choice
              legend="Font pair"
              hideLegend
              value={font.id}
              onChange={(id) => patch({ font: id })}
              options={fontPairs.map((pair) => ({
                value: pair.id,
                label: pair.label,
                preview: (
                  <span
                    aria-hidden="true"
                    className="block text-[1.75rem] leading-none text-ink"
                    style={{ fontFamily: pair.display, fontWeight: pair.displayWeight, fontStretch: pair.displayStretch, textTransform: pair.displayCase }}
                  >
                    Aa
                  </span>
                ),
              }))}
            />
          </LookGroup>

          <LookGroup title="Layout" summary={LAYOUT_LABEL[theme.layout][0]} changed={theme.changed.layout} onReset={() => reset("layout")}>
            <Choice legend="Arrangement" value={theme.layout} options={options.layouts} onChange={(layout) => patch({ layout })} />
            <Choice legend="Column width" columns={3} value={theme.width} options={WIDTHS.map((value) => ({ value, label: WIDTH_LABEL[value] }))} onChange={(width) => patch({ width })} />
            <Choice legend="Space between blocks" columns={3} value={theme.density} options={DENSITIES.map((value) => ({ value, label: DENSITY_LABEL[value] }))} onChange={(density) => patch({ density })} />
            <Choice legend="Photo shape" columns={3} value={theme.avatar} options={AVATARS.map((value) => ({ value, label: AVATAR_LABEL[value] }))} onChange={(avatar) => patch({ avatar })} />
          </LookGroup>

          <LookGroup title="Blocks" summary={`${BLOCK_LABEL[theme.blockStyle]}, ${SHAPE_LABEL[theme.shape].toLowerCase()}`} changed={theme.changed.blocks} onReset={() => reset("blocks")}>
            <Choice legend="Style" value={theme.blockStyle} options={options.blocks} onChange={(blockStyle) => patch({ blockStyle })} />
            <Choice legend="Corners" value={theme.shape} options={options.shapes} onChange={(shape) => patch({ shape })} />
          </LookGroup>

          <LookGroup title="Background" summary={BACKGROUND_LABEL[theme.background.kind]} changed={theme.changed.background} onReset={() => reset("background")}>
            <Choice
              legend="Pattern"
              columns={3}
              value={theme.background.kind}
              options={options.backgrounds}
              onChange={(kind) => {
                if (kind === "image" && !theme.background.image) {
                  document.getElementById("look-bg-upload")?.click()
                  return
                }
                patch({ background: { kind } })
              }}
            />
            <ColorField label="Second ink" value={theme.background.ink} onChange={(ink) => patch({ background: { ink } }, false)} />
            <div>
              <p className="type-small mb-1.5 font-semibold text-ink">Photo</p>
              <p className="type-small mb-2 font-normal text-ink-soft">Printed in your inks, behind the page. JPG or PNG, up to 5 MB.</p>
              <input
                id="look-bg-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void uploadBackground(file)
                }}
              />
              <Button variant="outline" className="h-11 w-full md:h-9" disabled={uploading} onClick={() => document.getElementById("look-bg-upload")?.click()}>
                {uploading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
                {uploading ? "Uploading" : theme.background.image ? "Use another photo" : "Upload a photo"}
              </Button>
              {uploadError && (
                <p role="alert" className="type-small mt-1.5 font-normal text-danger-ink">
                  {uploadError}
                </p>
              )}
            </div>
            {hasMovingBackground && (
              <label className="flex items-center justify-between gap-3">
                <span className="type-small font-semibold text-ink">
                  Play the motion here
                  <span className="block font-normal text-ink-soft">Visitors always see it move, unless they turned motion off.</span>
                </span>
                <Switch checked={ambient} onCheckedChange={setAmbient} aria-label="Play the background motion in the proof" />
              </label>
            )}
          </LookGroup>

          <LookGroup title="Motion" summary={`${ENTRANCE_LABEL[theme.motion.entrance][0]}, ${HOVER_LABEL[theme.motion.hover][0].toLowerCase()}`} changed={theme.changed.motion} onReset={() => reset("motion")}>
            <Choice
              legend="When the page opens"
              value={theme.motion.entrance}
              options={ENTRANCES.map((value) => ({ value, label: ENTRANCE_LABEL[value][0], hint: ENTRANCE_LABEL[value][1] }))}
              onChange={(entrance) => patch({ motion: { entrance } })}
            />
            <Button variant="outline" className="h-11 w-full md:h-9" onClick={() => setReplay((n) => n + 1)} disabled={theme.motion.entrance === "none"}>
              <Play aria-hidden="true" />
              Play the entrance again
            </Button>
            <Choice
              legend="When a visitor points at a link"
              value={theme.motion.hover}
              options={HOVERS.map((value) => ({ value, label: HOVER_LABEL[value][0], hint: HOVER_LABEL[value][1] }))}
              onChange={(hover) => patch({ motion: { hover } })}
            />
            <p className="type-small font-normal text-ink-soft">Visitors who turned motion off on their device see the page still.</p>
          </LookGroup>

          <LookGroup title="Advanced" summary={draft.customCSS ? "Custom CSS" : "None"}>
            <label htmlFor="look-css" className="type-small block font-semibold text-ink">
              Custom CSS
            </label>
            <p className="type-small -mt-3 font-normal text-ink-soft">
              Applies on your public page only, so the editor stays usable. The page root is <code>.lp</code>; links are <code>.lp-tile</code>.
            </p>
            <Textarea
              id="look-css"
              defaultValue={draft.customCSS}
              rows={8}
              maxLength={20000}
              spellCheck={false}
              onChange={(event) => commit({ ...draftRef.current, customCSS: event.target.value }, false)}
              className="text-sm"
              style={{ fontFamily: "ui-monospace, 'Cascadia Code', Menlo, monospace" }}
            />
          </LookGroup>
        </section>
      </aside>
    </div>
  )
}
