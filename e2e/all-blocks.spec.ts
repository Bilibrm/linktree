import { test, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

function getUserInfo() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "e2e", ".auth", "user-info.json"), "utf-8")
  )
}

type BlockDef = {
  label: string
  fill: (page: import("@playwright/test").Page, d: any) => Promise<void>
}

const BLOCKS: BlockDef[] = [
  {
    label: "Link",
    fill: async (page, d) => {
      await d.locator("input").nth(0).fill("My Portfolio")
      await d.locator("input").nth(1).fill("https://example.com")
    },
  },
  {
    label: "Header",
    fill: async (page, d) => {
      await d.locator("input").first().fill("Welcome to my corner of the web")
    },
  },
  {
    label: "Text",
    fill: async (page, d) => {
      await d.locator("textarea").first().fill("I build things for the web.")
    },
  },
  {
    label: "Divider",
    fill: async () => {},
  },
  {
    label: "Social Icons",
    fill: async (page, d) => {
      await d.getByRole("combobox").first().click()
      await page.waitForTimeout(300)
      await page.locator('[data-slot="popover-content"]').getByRole("button", { name: /^twitter$/i }).click()
      await page.waitForTimeout(200)
      await d.locator("input").first().fill("https://twitter.com/me")
    },
  },
  {
    label: "Image",
    fill: async (page, d) => {
      await d.locator("input").nth(0).fill("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80")
      await d.locator("input").nth(1).fill("A beautiful landscape")
    },
  },
  {
    label: "Gallery",
    fill: async (page, d) => {
      await d.locator("input").nth(0).fill("https://images.unsplash.com/photo-1470071459604-5d0e2e6c2b0e?w=400&q=80")
      await d.getByRole("button", { name: /add image/i }).click()
      await page.waitForTimeout(300)
      await d.locator("input").nth(1).fill("https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&q=80")
    },
  },
  {
    label: "Embed",
    fill: async (page, d) => {
      await d.locator("input").first().fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    },
  },
  {
    label: "Form",
    fill: async (page, d) => {
      const textInputs = d.locator('input:not([type="checkbox"])')
      await textInputs.nth(0).fill("Get in touch")
      await textInputs.nth(1).fill("Name")
      await d.getByRole("button", { name: /add field/i }).click()
      await page.waitForTimeout(300)
      await textInputs.nth(2).fill("Email")
      await d.locator("select").nth(1).selectOption("email")
    },
  },
  {
    label: "Countdown",
    fill: async (page, d) => {
      await d.locator("input").nth(0).fill("Launch Countdown")
      const future = new Date(Date.now() + 30 * 86400000)
      await d.locator("input").nth(1).fill(future.toISOString().slice(0, 16))
    },
  },
  {
    label: "Button",
    fill: async (page, d) => {
      await d.locator("input").nth(0).fill("Visit My Site")
      await d.locator("input").nth(1).fill("https://myportfolio.com")
    },
  },
  {
    label: "Spacer",
    fill: async (page, d) => {
      await d.getByRole("slider").fill("48")
    },
  },
  {
    label: "Video",
    fill: async (page, d) => {
      await d.locator("input").nth(0).fill("https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720p/Big_Buck_Bunny_720p_1mb.mp4")
      await d.locator("input").nth(1).fill("") // skip poster
      await d.locator("input").nth(2).fill("Big Buck Bunny")
    },
  },
]

test.describe("all blocks", () => {
  test("create all 13 block types and verify public page", async ({ page }) => {
    test.setTimeout(120_000)
    const ui = getUserInfo()

    await page.goto("/dashboard")
    await expect(page.getByRole("heading", { name: /your blocks/i })).toBeVisible({ timeout: 10000 })

    // --- delete existing blocks ---
    for (let attempt = 0; attempt < 20; attempt++) {
      const del = page.getByRole("button", { name: /delete block/i }).first()
      if (!(await del.isVisible().catch(() => false))) break
      await del.click()
      await page.getByRole("button", { name: /^delete$/i }).click()
      await page.waitForTimeout(1000)
    }
    await page.waitForTimeout(500)

    // --- empty state auto-selects Link ---
    const emptyBtn = page.getByRole("button", { name: /add your first block/i })
    let firstAdded = false
    if (await emptyBtn.isVisible().catch(() => false)) {
      await emptyBtn.click()
      const dialog = page.locator('[data-slot="dialog-content"]')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await BLOCKS[0].fill(page, dialog)
      await dialog.getByRole("button", { name: /add link/i }).click()
      await expect(dialog).not.toBeVisible({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(500)
      firstAdded = true
    }

    // --- add remaining block types ---
    const startIdx = firstAdded ? 1 : 0
    for (let i = startIdx; i < BLOCKS.length; i++) {
      const bt = BLOCKS[i]

      // Wait for dialog overlay to be gone before clicking
      await page.waitForTimeout(300)
      await page.getByRole("button", { name: /add block/i }).click()
      const dialog = page.locator('[data-slot="dialog-content"]')
      await expect(dialog).toBeVisible({ timeout: 5000 })

      await dialog.getByRole("button", { name: new RegExp("^" + bt.label + "\\b", "i") }).click()
      await page.waitForTimeout(500)

      await bt.fill(page, dialog)
      await page.waitForTimeout(500)

      await dialog.getByRole("button", { name: new RegExp("add " + bt.label, "i") }).click()
      await expect(dialog).not.toBeVisible({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(500)
    }

    // --- ensure page is publicly accessible ---
    await page.goto("/dashboard/appearance")
    await expect(page.getByRole("heading", { name: /appearance/i })).toBeVisible({ timeout: 10000 })

    const visibilityTab = page.getByRole("tab", { name: /visibility/i })
    if (await visibilityTab.isVisible().catch(() => false)) {
      await visibilityTab.click()
      await page.waitForTimeout(300)
      const combo = page.getByRole("combobox").first()
      if (await combo.isVisible().catch(() => false)) {
        const currentVal = await combo.textContent().catch(() => "")
        if (currentVal && !/public/i.test(currentVal)) {
          await combo.click()
          await page.getByRole("option", { name: /^public/i }).click()
          await page.waitForTimeout(200)
          await page.getByRole("button", { name: /save changes/i }).click()
          await page.waitForTimeout(1500)
        }
      }
    }

    // --- visit public page ---
    const publicUrl = `/${ui.username}`
    await page.goto(publicUrl)
    await page.waitForTimeout(2000)

    // Handle password gate if still present
    const pwInput = page.getByPlaceholder(/password|enter password/i).first()
    if (await pwInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pwInput.fill("secret123")
      await page.getByRole("button", { name: /unlock|enter/i }).click()
      await page.waitForTimeout(2000)
    }

    // Screenshots
    await page.screenshot({ path: "e2e/public-page-full.png", fullPage: true })
    await page.screenshot({ path: "e2e/public-page-viewport.png", fullPage: false })

    await expect(page.locator("body")).toBeVisible()

    for (const text of ["My Portfolio", "Welcome to my corner", "Visit My Site", "Launch Countdown", "Get in touch"]) {
      await expect(page.getByText(text).first()).toBeVisible({ timeout: 5000 })
    }

    console.log(`\n\n=== PUBLIC PAGE URL ===\nhttp://localhost:3000${publicUrl}\n`)
    console.log(`Username: ${ui.username}\nPassword: ${ui.password}\n`)
    console.log(`Screenshots: e2e/public-page-full.png\n`)
  })
})
