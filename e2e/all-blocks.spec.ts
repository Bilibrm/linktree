import { test, expect, type Locator, type Page } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"
import { addBlock, clearBlocks, inspector, openEditor, proofBlocks, waitForSaved } from "./editor"

function getUserInfo() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "e2e", ".auth", "user-info.json"), "utf-8")
  )
}

type BlockDef = {
  /** Name in the block picker and in the inspector heading. */
  label: string
  /** Fill the inspector. `f` is scoped to it. */
  fill: (f: Locator, page: Page) => Promise<void>
}

const BLOCKS: BlockDef[] = [
  {
    label: "Link",
    fill: async (f) => {
      await f.getByLabel("Title", { exact: true }).fill("My Portfolio")
      await f.getByLabel("Web address", { exact: true }).fill("https://example.com")
    },
  },
  {
    label: "Header",
    fill: async (f) => {
      await f.getByLabel("Heading", { exact: true }).fill("Welcome to my corner of the web")
    },
  },
  {
    label: "Text",
    fill: async (f) => {
      await f.getByLabel("Text", { exact: true }).fill("I build things for the web.")
    },
  },
  {
    label: "Divider",
    fill: async () => {},
  },
  {
    label: "Social icons",
    fill: async (f, page) => {
      await f.getByRole("combobox", { name: "Platform for profile 1" }).click()
      await page.locator('[data-slot="popover-content"]').getByRole("button", { name: /^twitter/i }).click()
      await f.getByLabel("Web address for profile 1").fill("https://twitter.com/me")
    },
  },
  {
    label: "Image",
    fill: async (f) => {
      await f.getByLabel("Image address", { exact: true }).fill("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80")
      await f.getByLabel(/^Caption/).fill("A beautiful landscape")
    },
  },
  {
    label: "Gallery",
    fill: async (f) => {
      await f.getByLabel("Image 1 address").fill("https://images.unsplash.com/photo-1470071459604-5d0e2e6c2b0e?w=400&q=80")
      await f.getByRole("button", { name: "Add image" }).click()
      await f.getByLabel("Image 2 address").fill("https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&q=80")
    },
  },
  {
    label: "Embed",
    fill: async (f) => {
      await f.getByLabel("Link to embed").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    },
  },
  {
    label: "Form",
    fill: async (f) => {
      await f.getByLabel("Form title").fill("Get in touch")
      await f.getByLabel("Field 1 label").fill("Name")
      await f.getByRole("button", { name: "Add field" }).click()
      await f.getByLabel("Field 2 label").fill("Email")
      await f.getByLabel("Field 2 type").selectOption("email")
    },
  },
  {
    label: "Countdown",
    fill: async (f) => {
      await f.getByLabel("Title", { exact: true }).fill("Launch Countdown")
      const future = new Date(Date.now() + 30 * 86400000)
      await f.getByLabel("Counts down to").fill(future.toISOString().slice(0, 16))
    },
  },
  {
    label: "Button",
    fill: async (f) => {
      await f.getByLabel("Label", { exact: true }).fill("Visit My Site")
      await f.getByLabel("Web address", { exact: true }).fill("https://myportfolio.com")
    },
  },
  {
    label: "Spacer",
    fill: async (f) => {
      await f.getByRole("slider").fill("48")
    },
  },
  {
    label: "Video",
    fill: async (f) => {
      await f.getByLabel("Video address").fill("https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720p/Big_Buck_Bunny_720p_1mb.mp4")
      await f.getByLabel(/^Caption/).fill("Big Buck Bunny")
    },
  },
]

test.describe("all blocks", () => {
  test("create all 13 block types and verify public page", async ({ page }, testInfo) => {
    test.setTimeout(180_000)
    const ui = getUserInfo()

    await openEditor(page)
    await clearBlocks(page)
    await expect(page.getByText("Add your first block")).toBeVisible()

    // --- add every block type through the picker; each lands at the end, selected ---
    for (const [i, bt] of BLOCKS.entries()) {
      await addBlock(page, bt.label)
      await expect(proofBlocks(page)).toHaveCount(i + 1)
      await expect(proofBlocks(page).nth(i)).toHaveAttribute("aria-selected", "true")
      await bt.fill(inspector(page), page)
      await waitForSaved(page)
    }

    // --- insert one more through the "+" line above the second block ---
    // The line shows when the gap is hovered or focused.
    const plusLine = page.getByRole("button", { name: /^Add a block before Header/ })
    await plusLine.hover()
    await plusLine.click()
    await page.getByPlaceholder("Search blocks").fill("Text")
    await page.getByRole("option", { name: /^Text\b/ }).click()
    await expect(proofBlocks(page)).toHaveCount(BLOCKS.length + 1)
    await expect(proofBlocks(page).nth(1)).toHaveAttribute("aria-selected", "true")
    await inspector(page).getByLabel("Text", { exact: true }).fill("Inserted between two blocks.")
    await waitForSaved(page)

    // --- ensure page is publicly accessible ---
    await page.goto("/dashboard/settings")
    await page.getByLabel("Who can see it").selectOption("public")
    await page.getByRole("button", { name: /save settings/i }).click()
    await page.waitForTimeout(1500)

    // --- visit public page ---
    const publicUrl = `/${ui.username}`
    await page.goto(publicUrl)
    await page.waitForTimeout(2000)

    // Screenshots
    await page.screenshot({ path: "e2e/public-page-full.png", fullPage: true })
    await page.screenshot({ path: "e2e/public-page-viewport.png", fullPage: false })

    await expect(page.locator("body")).toBeVisible()

    for (const text of ["My Portfolio", "Welcome to my corner", "Inserted between two blocks.", "Visit My Site", "Launch Countdown", "Get in touch"]) {
      await expect(page.getByText(text).first()).toBeVisible({ timeout: 5000 })
    }

    console.log(`\n\n=== PUBLIC PAGE URL ===\n${testInfo.project.use.baseURL}${publicUrl}\n`)
    console.log(`Username: ${ui.username}\nPassword: ${ui.password}\n`)
    console.log(`Screenshots: e2e/public-page-full.png\n`)
  })
})
