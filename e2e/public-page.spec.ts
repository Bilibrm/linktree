import { test, expect } from "@playwright/test"

test.describe("Public page theming", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("body")).toBeVisible()
  })

  test("auth page loads", async ({ page }) => {
    await page.goto("/auth/login")
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
  })

  test("scrollbar styles are injected", async ({ page }) => {
    await page.goto("/")
    const hasScrollbarStyle = await page.evaluate(() => {
      const sheet = document.styleSheets[0]
      if (!sheet) return false
      for (let i = 0; i < sheet.cssRules.length; i++) {
        const rule = sheet.cssRules[i] as CSSStyleRule
        if (rule.selectorText?.includes("::-webkit-scrollbar")) return true
      }
      return false
    })
    expect(hasScrollbarStyle).toBe(true)
  })
})
