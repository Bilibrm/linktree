import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  experimental: {
    // Dashboard tab changes crossfade through React <ViewTransition> (DESIGN_SYSTEM.md §6.2).
    viewTransition: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Theme font pairs load one Google Fonts stylesheet (lib/themes/fonts.ts).
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Owners link images from anywhere (avatars, thumbnails, favicons): any https image.
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "media-src 'self' blob: https:",
              "connect-src 'self'",
              // The two players the embed block knows (components/blocks/embed-block.tsx).
              "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://open.spotify.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
