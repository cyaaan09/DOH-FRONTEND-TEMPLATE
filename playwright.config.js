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
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Must come after the spread: Desktop Chrome carries its own
        // 1280x720 viewport, which otherwise wins over anything set in the
        // top-level `use` above (project `use` replaces global `use`
        // key-by-key, not a deep merge). Fixed viewport: every layout
        // assertion in this suite is deterministic only against a known
        // size. 1280 is wide enough that the page's own max-w-5xl cap
        // (1024px) is what constrains content, matching real use.
        viewport: { width: 1280, height: 900 },
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: HOST,
    // Always rebuild and boot fresh. This repo has no CI workflow, so
    // `!process.env.CI` was always true in practice, and Playwright's reuse
    // check is a bare HTTP reachability probe with no freshness check --
    // an orphaned `vite preview` left on this port (killed terminal,
    // interrupted run) would make the next run silently assert against a
    // stale build. The build takes ~1s and the full suite runs in a few
    // seconds, so the cost of always rebuilding is negligible next to the
    // risk of a meaningless pass.
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
