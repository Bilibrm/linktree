import { test, expect } from "@playwright/test"

test.describe("Theme system", () => {
  test("globals define custom scrollbar styles", async ({ page }) => {
    await page.goto("/")
    const hasScrollbarRule = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i] as CSSStyleRule
            if (rule.selectorText?.includes("::-webkit-scrollbar")) return true
          }
        } catch { /* cross-origin stylesheets */ }
      }
      return false
    })
    expect(hasScrollbarRule).toBe(true)
  })

  test("animated background keyframes exist in CSS", async ({ page }) => {
    await page.goto("/")
    const hasKeyframes = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i] as CSSKeyframesRule
            if (rule.name === "gradient-shift") return true
          }
        } catch { /* skip */ }
      }
      return false
    })
    expect(hasKeyframes).toBe(true)
  })
})
