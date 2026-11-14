import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/sidebar"
import { DashboardTopBar } from "@/components/dashboard/top-bar"
import { DashboardThemeProvider } from "@/components/dashboard/theme-provider"
import { TabTransition } from "@/components/dashboard/tab-transition"
import { SaveStateProvider } from "@/components/dashboard/save-state"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <DashboardThemeProvider>
      <SaveStateProvider>
        <div className="flex h-dvh overflow-hidden bg-paper text-ink">
          <DashboardNav />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardTopBar username={session.user.username || ""} />
            {/* Bottom padding clears the tab bar below 768px. Tab changes crossfade (§6.2). */}
            <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
              <TabTransition>{children}</TabTransition>
            </main>
          </div>
        </div>
      </SaveStateProvider>
    </DashboardThemeProvider>
  )
}
