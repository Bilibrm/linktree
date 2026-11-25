import { ImageResponse } from "next/og"

export const alt = "LinkNest: one page for all of it"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Press tokens (DESIGN_SYSTEM.md §3). ImageResponse cannot read CSS variables.
const paper = "#ECEDE8"
const ink = "#1C2A63"
const pink = "#FF4FA3"
const overprint = "#7A2E8E"

const HEADLINE = ["One page", "for all", "of it."]
const FOOT = "Free and open source link-in-bio pages"

/**
 * Archivo (DESIGN_SYSTEM.md §4) at the weight and width the image uses, subset to the
 * characters it draws. ImageResponse needs TTF/OTF bytes, so this asks the Google Fonts
 * API for a static instance; it runs once at build. If the request fails the image still
 * renders, in the default face.
 */
async function archivo(wdth: number, wght: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@${wdth},${wght}&text=${encodeURIComponent(text)}`)
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await (await fetch(url)).arrayBuffer()
  } catch {
    return null
  }
}

const headline = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  display: "flex",
  flexDirection: "column" as const,
  fontSize: 118,
  fontWeight: 800,
  lineHeight: 0.9,
  letterSpacing: "-0.04em",
  textTransform: "uppercase" as const,
}

export default async function OpenGraphImage() {
  const [display, body] = await Promise.all([
    archivo(125, 800, HEADLINE.join("").toUpperCase()),
    archivo(100, 700, `LinkNest${FOOT}`),
  ])
  const fonts = [
    ...(display ? [{ name: "Archivo Expanded", data: display, weight: 800 as const, style: "normal" as const }] : []),
    ...(body ? [{ name: "Archivo", data: body, weight: 700 as const, style: "normal" as const }] : []),
  ]
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: paper,
        color: ink,
        padding: 64,
        fontFamily: body ? "Archivo" : "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>
        <svg width="56" height="56" viewBox="0 0 64 64" style={{ marginRight: 16 }}>
          <circle cx="24" cy="32" r="18" fill={pink} />
          <circle cx="40" cy="32" r="18" fill={ink} />
          <path d="M32 15.88A18 18 0 0 1 32 48.12 18 18 0 0 1 32 15.88Z" fill={overprint} />
        </svg>
        LinkNest
      </div>

      {/* Two plates, slightly out of register */}
      <div style={{ display: "flex", position: "relative", height: 380 }}>
        {[pink, ink].map((color) => (
          <div
            key={color}
            style={{
              ...headline,
              color,
              fontFamily: display ? "Archivo Expanded" : "sans-serif",
              // The pink plate a hair out of register, as on the landing hero.
              ...(color === pink ? { left: -4, top: 3 } : {}),
            }}
          >
            {HEADLINE.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>{FOOT}</div>
    </div>,
    { ...size, fonts },
  )
}
