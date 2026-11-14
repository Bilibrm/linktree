import { ImageResponse } from "next/og"

export const alt = "LinkNest — One page for all of it"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Press tokens (DESIGN_SYSTEM.md §3). ImageResponse cannot read CSS variables.
const paper = "#ECEDE8"
const ink = "#1C2A63"
const pink = "#FF4FA3"
const overprint = "#7A2E8E"

const headline = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  display: "flex",
  flexDirection: "column" as const,
  fontSize: 136,
  fontWeight: 900,
  lineHeight: 0.9,
  letterSpacing: "-0.04em",
  textTransform: "uppercase" as const,
}

export default function OpenGraphImage() {
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
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800 }}>
        <svg width="56" height="56" viewBox="0 0 64 64" style={{ marginRight: 16 }}>
          <circle cx="24" cy="32" r="18" fill={pink} />
          <circle cx="40" cy="32" r="18" fill={ink} />
          <path d="M32 15.88A18 18 0 0 1 32 48.12 18 18 0 0 1 32 15.88Z" fill={overprint} />
        </svg>
        LinkNest
      </div>

      {/* Two plates, slightly out of register */}
      <div style={{ display: "flex", position: "relative", height: 380 }}>
        <div style={{ ...headline, color: pink, left: -8, top: 7 }}>
          <span>One page</span>
          <span>for all</span>
          <span>of it.</span>
        </div>
        <div style={{ ...headline, color: ink }}>
          <span>One page</span>
          <span>for all</span>
          <span>of it.</span>
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>Free and open source link-in-bio pages</div>
    </div>,
    size,
  )
}
