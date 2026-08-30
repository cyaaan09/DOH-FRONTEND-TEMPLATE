import { defineConfig, devices } from '@playwright/test'

// Port 5178 deliberately: vite.config.js pins the dev server to 5177 with
// strictPort, so reusing it would make this suite fail whenever `npm run dev`
// is running.
const PORT = 5178
const HOST = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: HOST,
    // Fixed viewport: every layout assertion in this suite is deterministic
    // only against a known width. 1280 is wide enough that the page's own
    // max-w-5xl cap (1024px) is what constrains content, matching real use.
    viewport: { width: 1280, height: 900 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: HOST,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
