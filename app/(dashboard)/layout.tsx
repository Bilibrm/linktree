import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardThemeProvider } from "@/components/dashboard/theme-provider"
import { DashboardToaster } from "@/components/dashboard/dashboard-toaster"
import { connectDB } from "@/lib/db/mongoose"
import { Page } from "@/lib/models/page"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  await connectDB()
  const page = await Page.findOne({ userId: session.user.id }).lean()

  return (
    <DashboardThemeProvider>
      <div className="flex h-dvh overflow-hidden" style={{ backgroundColor: "var(--dashboard-bg)", color: "var(--dashboard-text)" }}>
        <DashboardSidebar username={session.user.username || ""} pageId={page?._id?.toString() || ""} />
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--dashboard-bg)", color: "var(--dashboard-text)" }}>
          {children}
        </main>
      </div>
      <DashboardToaster />
    </DashboardThemeProvider>
  )
}
