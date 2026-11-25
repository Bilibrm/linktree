import { test, expect } from "@playwright/test"

/** Theme system v2 in the browser (DESIGN_SYSTEM.md §8.9). The pure migration checks live in theme-migration.spec.ts. */
test.describe("Theme system", () => {
  test("the landing picker reprints the sample page in each theme", async ({ page }) => {
    await page.goto("/")
    const proof = page.locator("figure").filter({ hasText: "linknest-dz.vercel.app/amina" }).last()
    await proof.scrollIntoViewIfNeeded()
    for (const [name, id] of [
      ["Zine", "zine"],
      ["Poster", "poster"],
      ["Blueprint", "blueprint"],
    ]) {
      await page.getByRole("radio", { name, exact: true }).check({ force: true })
      await expect(proof.locator(".lp")).toHaveAttribute("data-theme", id)
    }
  })

  test("theme art and fonts load without CSP errors", async ({ page }) => {
    const blocked: string[] = []
    page.on("console", (m) => {
      if (m.type() === "error" && /Content Security Policy/i.test(m.text())) blocked.push(m.text())
    })
    await page.goto("/")
    await page.getByRole("radio", { name: "Ticket Stub", exact: true }).check({ force: true })
    await page.waitForLoadState("networkidle")
    expect(blocked).toEqual([])
  })

  test("reduced motion leaves every block visible", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" })
    const page = await context.newPage()
    await page.goto("/")
    const item = page.locator(".lp .lp-item").first()
    await expect(item).toBeVisible()
    expect(await item.evaluate((el) => getComputedStyle(el).opacity)).toBe("1")
    await context.close()
  })
})
