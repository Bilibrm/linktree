import { defineConfig } from "@playwright/test"
import path from "path"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "auth-tests",
      testMatch: "**/full-flow.spec.ts",
      use: {
        storageState: path.join(process.cwd(), "e2e", ".auth", "user.json"),
      },
    },
    {
      name: "public-tests",
      testMatch: ["**/theming.spec.ts", "**/public-page.spec.ts"],
    },
  ],
})
