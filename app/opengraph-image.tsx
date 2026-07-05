import { ImageResponse } from "next/og"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0F211D",
        fontFamily: "Fraunces, Georgia, serif",
        color: "#E7DFC9",
        padding: 60,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 64 64" style={{ marginBottom: 24 }}>
        <circle cx="32" cy="14" r="5" fill="none" stroke="#D2A24C" strokeWidth="3" />
        <path d="M10,38 Q20,24 32,24 Q44,24 54,38" fill="none" stroke="#D2A24C" strokeWidth="3" strokeLinecap="round" />
        <path d="M14,44 Q22,32 32,32 Q42,32 50,44" fill="none" stroke="#D2A24C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19,50 Q26,40 32,40 Q38,40 45,50" fill="none" stroke="#D2A24C" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#E7DFC9",
          marginBottom: 16,
        }}
      >
        LinkNest
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#8DA89E",
          textAlign: "center",
          maxWidth: 500,
          lineHeight: 1.4,
        }}
      >
        Your corner of the web
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
