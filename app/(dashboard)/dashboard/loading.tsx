/**
 * Shown while a dashboard tab loads: the shape of a page title and a proof, in tints of
 * ink. Still, no shimmer (§6.2: no looping motion in the app).
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-40 rounded-label bg-tint" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-label bg-tint" />
      <div className="mx-auto mt-12 h-[min(60vh,560px)] w-full max-w-[380px] rounded-panel border border-rule bg-sheet" />
    </div>
  )
}
