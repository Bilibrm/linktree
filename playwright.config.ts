import { defineConfig } from "@playwright/test"
import path from "path"

// Local dev can run on another port: `E2E_PORT=3001 npx playwright test`.
const port = Number(process.env.E2E_PORT || 3000)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    headless: true,
  },
  webServer: {
    command: `npx next dev -p ${port}`,
    port,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "auth-tests",
      testMatch: ["**/full-flow.spec.ts", "**/all-blocks.spec.ts"],
      use: {
        storageState: path.join(process.cwd(), "e2e", ".auth", "user.json"),
      },
      workers: 1,
    },
    {
      name: "public-tests",
      testMatch: ["**/theming.spec.ts", "**/public-page.spec.ts"],
    },
  ],
})
