import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — LinkNest",
  description: "LinkNest privacy policy. We do not sell your data. Period.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bone text-ink">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="font-display font-black text-xl tracking-tight text-ink mb-12 inline-block">
          LinkNest
        </Link>
        <h1 className="font-display text-display font-bold mt-8 mb-2">Privacy Policy</h1>
        <p className="text-caption text-muted-foreground mb-10">Last updated: July 2026</p>

        <div className="space-y-8 text-body leading-relaxed">
          <section>
            <h2 className="font-display text-heading font-semibold mb-2">Data We Collect</h2>
            <p className="text-muted-foreground">
              We collect only what you give us: your email, username, display name, and avatar. Page blocks and form submissions are stored so we can serve your page to visitors.
            </p>
          </section>

          <section>
            <h2 className="font-display text-heading font-semibold mb-2">Analytics</h2>
            <p className="text-muted-foreground">
              Page views and clicks are counted anonymously. We do not use third-party analytics, cookies, or tracking pixels. You own your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-heading font-semibold mb-2">Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, rent, or share your personal data. Form submissions are stored on your behalf and are not used for training or advertising.
            </p>
          </section>

          <section>
            <h2 className="font-display text-heading font-semibold mb-2">Infrastructure</h2>
            <p className="text-muted-foreground">
              Data is hosted on MongoDB Atlas (AWS). Images are served via Cloudinary. Both providers are GDPR and SOC 2 compliant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-heading font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground">
              To request data deletion or export, open an issue on our{" "}
              <a href="https://github.com/bouremabillal/linktree" className="text-gold hover:underline">GitHub repository</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
