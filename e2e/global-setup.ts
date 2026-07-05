import { chromium } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  const timestamp = Date.now()
  const user = {
    username: `test-${timestamp}`,
    email: `test-${timestamp}@example.com`,
    password: "TestPass123!",
    name: "Test User",
  }

  // Go to signup
  await page.goto("http://localhost:3000/auth/signup")

  // Wait for the form to load
  await page.waitForSelector("#username", { timeout: 10000 })

  // Fill signup form
  await page.fill("#username", user.username)
  await page.waitForTimeout(600)
  await page.fill("#name", user.name)
  await page.fill("#email", user.email)
  await page.fill("#password", user.password)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard", { timeout: 20000 })

  // Save storage state
  const authDir = path.join(process.cwd(), "e2e", ".auth")
  fs.mkdirSync(authDir, { recursive: true })
  await page.context().storageState({ path: path.join(authDir, "user.json") })

  // Save user info for tests
  fs.writeFileSync(path.join(authDir, "user-info.json"), JSON.stringify(user, null, 2))

  await browser.close()
}

export default globalSetup
