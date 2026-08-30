# Layout Smoke Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Catch the class of defect that 350 passing unit tests structurally cannot see — real computed layout on the real page — by adding a small Playwright suite that reproduces the three layout bugs already shipped and caught by eye.

**Architecture:** Playwright drives a real Chromium against a production `vite preview` build of `/design-system`, so the assertions run against real CSS, real cascade layers and real box computation. It stays a **separate** gate: `npx vitest run` remains the fast inner loop and gains nothing here, because jsdom computes no layout at all.

**Tech Stack:** `@playwright/test`, Vite 8 preview server, Vue 3.5

**Spec:** `docs/superpowers/specs/2026-08-29-design-system-design.md` — Appendix C for the redlined values the assertions encode, §17 for the demo page's purpose ("any visual difference is a real defect rather than something to interpret").

**Phase:** 3d-a. Phases 1 through 3c are complete on branch `design-system` (350 tests, 5 of 15 sections). Selection controls follows in its own plan, and is the first section this harness will protect.

## Why This Exists

Three defects have shipped and been caught by a human looking at the page, never by the suite:

1. **`SpecsSection`'s stat block rendered flush to the card edge** while every sibling was inset by `px-card-x`, because it was a bare child of `DemoCard`'s slot.
2. **`StageTabs`' five cards collapsed into a vertical stack** at the demo page's real 293px column width — under a heading reading "A WORKFLOW WITH VOLUME PER STEP".
3. **`MultiSelect`'s panel rendered narrower than its own trigger**, because Zag defaults `minWidth: max-content` unless `sameWidth` is passed.

Each was invisible to jsdom. Each is trivially detectable in a real browser. This plan encodes all three as regression tests, then adds general guards for the same class.

## Global Constraints

- Node `^20.19.0 || >=22.12.0`.
- **This suite must not join the inner loop.** `npx vitest run`, `npm run verify:css` and `npm run lint` stay exactly as they are. Playwright is a fourth, slower gate run once per section, not on every edit.
- `vitest.config.js` already excludes `e2e/**`. Do not change that exclusion, and do not put Playwright specs anywhere Vitest would collect them — the two runners' `expect` APIs differ and cross-collection produces confusing failures.
- **The dev server is pinned to port 5177 with `strictPort: true`.** The preview server for tests must use a different port, or a running dev server will make the suite fail to start.
- Assertions must be **deterministic at a fixed viewport**. No assertion may depend on font rendering, animation timing, or scrollbar width.
- **Never assert a number the spec does not contain.** Every geometric assertion either compares two live elements to each other (panel width vs trigger width) or encodes a redlined value cited by name.
- Commit messages carry **no** `Co-Authored-By` trailer.

## File Structure

```
package.json                    MODIFIED — + @playwright/test, + test:e2e script  (Task 1)
playwright.config.js            NEW — webServer, fixed viewport, chromium only    (Task 1)
e2e/design-system.smoke.spec.js NEW — page loads, sections present                (Task 1)
e2e/design-system.layout.spec.js NEW — the three regressions                      (Task 2)
                                MODIFIED — general overflow guards                (Task 3)
.gitignore                      MODIFIED — Playwright's report/result dirs        (Task 1)
```

---

### Task 1: Playwright harness that loads the page

**Files:**
- Modify: `package.json`, `.gitignore`
- Create: `playwright.config.js`, `e2e/design-system.smoke.spec.js`

**Interfaces:**
- Produces: `npm run test:e2e` — builds, previews, runs Chromium against `/design-system`. Tasks 2 and 3 add specs to the same `e2e/` directory and rely on this config's `baseURL` and viewport.

- [ ] **Step 1: Install Playwright and its browser**

```bash
npm install --save-dev --save-exact @playwright/test@1.56.1
npx playwright install chromium
```

Pinned exactly, matching how `@ark-ui/vue` is pinned in this repo. `playwright install` downloads a browser binary (~150MB) into a machine-level cache, not into the repo — nothing to gitignore from it.

If `1.56.1` does not resolve, install the current stable instead and **report the version you used** rather than guessing at a nearby one.

- [ ] **Step 2: Add the config**

Create `playwright.config.js`:

```js
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
```

The suite runs against a **production build**, not the dev server, so it exercises the same compiled CSS that `verify:css` checks and that ships.

- [ ] **Step 3: Add the script and ignore Playwright's output**

In `package.json` scripts, after `test:unit`:

```json
"test:e2e": "playwright test",
```

Append to `.gitignore`:

```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

- [ ] **Step 4: Write the smoke spec**

Create `e2e/design-system.smoke.spec.js`:

```js
import { expect, test } from '@playwright/test'

test.describe('design-system page', () => {
  test('loads and renders every section in the manifest', async ({ page }) => {
    await page.goto('/design-system')

    // Spec §17 — the page is a checklist of the whole system; a section that
    // fails to render is invisible rather than obviously broken.
    const sections = page.locator('[data-section]')
    await expect(sections).toHaveCount(15)

    for (const id of ['foundations', 'tabs', 'dropdowns', 'buttons', 'tokens']) {
      await expect(page.locator(`[data-section="${id}"]`)).toBeVisible()
    }
  })

  test('still shows unbuilt work as visible gaps', async ({ page }) => {
    // Sanity: the page is a progress checklist. If gaps ever hit zero while
    // sections remain incomplete, the markers have been lost, not the work done.
    await page.goto('/design-system')
    expect(await page.locator('[data-gap]').count()).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 5: Run it**

Run: `npm run test:e2e`
Expected: PASS — 2 tests. First run is slow: it builds the app and starts a preview server.

If the build or server start fails, report the actual error. Do not weaken an assertion to get a green run.

- [ ] **Step 6: Confirm the unit suite is untouched, then commit**

Run: `npx vitest run && npm run verify:css && npm run lint`
Expected: still 350 tests, all green. Vitest must **not** have collected the `e2e/` specs — if the count changed, the exclusion is broken; stop and report.

```bash
git add package.json package-lock.json playwright.config.js e2e/ .gitignore
git commit -m "test(ds): add a Playwright harness for real-browser layout checks"
```

---

### Task 2: Reproduce the three shipped layout bugs

Each test here corresponds to a defect that reached the branch and was caught by eye. Each must **fail** against the code as it was before its fix, and pass now.

**Files:**
- Create: `e2e/design-system.layout.spec.js`

**Interfaces:** Consumes the config from Task 1.

- [ ] **Step 1: Write the three regression tests**

Create `e2e/design-system.layout.spec.js`:

```js
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
})

test.describe('layout regressions caught by eye, not by jsdom', () => {
  test('the stat block is inset by the card padding like its siblings', async ({ page }) => {
    // Regression: this block shipped as a bare child of DemoCard's slot, so it
    // rendered flush to the card edge while the header and DemoBlocks were
    // inset by px-card-x. Compares two live elements rather than a magic number.
    const section = page.locator('[data-section="specs"]')
    const heading = section.locator('h2')
    const firstStat = section.locator('[data-stat-block] [data-figure]').first()

    const headingBox = await heading.boundingBox()
    const statBox = await firstStat.boundingBox()

    expect(headingBox).not.toBeNull()
    expect(statBox).not.toBeNull()
    // The stat card's own left edge sits at the section's content inset. Allow
    // 1px for the card's own border, nothing more.
    expect(Math.abs(statBox.x - headingBox.x)).toBeLessThanOrEqual(2)
  })

  test('the five stage cards sit in one row, not a vertical stack', async ({ page }) => {
    // Regression: at the page's real column width the stage grid's own
    // minmax() could not fit two columns, so all five cards stacked under a
    // heading reading "A WORKFLOW WITH VOLUME PER STEP".
    const cards = page.locator('[data-section="tabs"] [role="tab"]:has([data-step])')
    await expect(cards).toHaveCount(5)

    const boxes = await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.getBoundingClientRect().top),
    )
    const first = boxes[0]
    for (const [i, top] of boxes.entries()) {
      expect(Math.abs(top - first), `stage card ${i} wrapped to another row`).toBeLessThanOrEqual(2)
    }
  })

  test("the multi-select panel matches its trigger's width", async ({ page }) => {
    // Regression: Zag defaults the positioner to minWidth:max-content, so the
    // panel sized to its longest option — roughly 100px narrower than its own
    // field — until `sameWidth: true` was passed.
    const trigger = page.locator('[data-section="dropdowns"] [aria-label="Services"]')
    const triggerBox = await trigger.boundingBox()
    await trigger.click()

    const panel = page.locator('[role="listbox"]:visible')
    await expect(panel).toBeVisible()
    const panelBox = await panel.boundingBox()

    expect(Math.abs(panelBox.width - triggerBox.width), 'panel is not trigger width').toBeLessThanOrEqual(2)
  })
})
```

- [ ] **Step 2: Run them**

Run: `npm run test:e2e`
Expected: PASS — 5 tests total across both spec files.

If a selector finds nothing, **report what the page actually renders** (`await page.locator(...).count()`, or a screenshot) rather than loosening the selector until something matches. A test that passes by selecting the wrong element is worse than none — this repo has already shipped one assertion that passed against a class emitting no CSS.

- [ ] **Step 3: Prove each test actually catches its bug**

This is the step that makes the suite worth its cost. For each of the three, temporarily reintroduce the original defect, confirm the test fails, then restore:

1. Remove `px-card-x` from `SpecsSection.vue`'s `[data-stat-block]` div → the stat test must fail.
2. Change `StageTabs.vue`'s grid to `minmax(300px, 1fr)` → the stage-card test must fail.
3. Remove `sameWidth: true` from `MultiSelect.vue`'s positioning → the panel test must fail.

Record the actual failure message for each in your report. Restore all three and confirm green. **`git diff` must be empty** for `src/` when you are done.

- [ ] **Step 4: Commit**

Run: `npx vitest run && npm run verify:css && npm run lint && npm run test:e2e`

```bash
git add e2e/
git commit -m "test(ds): reproduce the three layout bugs jsdom could not see"
```

---

### Task 3: General guards for the same defect class

The three tests above catch defects we already know. These catch the shape of them in sections not yet built.

**Files:**
- Modify: `e2e/design-system.layout.spec.js`

**Interfaces:** Consumes the config from Task 1.

- [ ] **Step 1: Add the general guards**

Append a second `describe` to `e2e/design-system.layout.spec.js`:

```js
test.describe('page-level layout guards', () => {
  test('the page never scrolls horizontally', async ({ page }) => {
    // Spec §12 — the page is the conformance surface; a horizontal scrollbar
    // means something inside it is wider than its container.
    const overflow = await page.evaluate(() => {
      const el = document.documentElement
      return el.scrollWidth - el.clientWidth
    })
    expect(overflow, 'document scrolls horizontally').toBeLessThanOrEqual(0)
  })

  test('no section card is overflowed by its own content', async ({ page }) => {
    // Catches the class the Tabs underline row hit: a flex row with no wrap and
    // whitespace-nowrap children spilling past the card, where DemoCard's
    // overflow-hidden then clips it silently.
    const offenders = await page.evaluate(() => {
      const bad = []
      for (const section of document.querySelectorAll('[data-section]')) {
        const card = section.querySelector('section')
        if (!card) continue
        const limit = card.getBoundingClientRect().right
        for (const child of card.querySelectorAll('*')) {
          const rect = child.getBoundingClientRect()
          // Portalled panels are positioned against the viewport, not the card,
          // and are legitimately allowed outside it.
          if (rect.width === 0 || child.closest('[role="listbox"],[role="menu"]')) continue
          if (rect.right - limit > 2) {
            bad.push(`${section.dataset.section}: ${child.tagName.toLowerCase()}.${child.className}`)
            break
          }
        }
      }
      return bad
    })
    expect(offenders, `content overflows its card in: ${offenders.join(' | ')}`).toEqual([])
  })

  test('every section marked complete renders no gap markers', async ({ page }) => {
    // The unit suite asserts this against the manifest; this asserts it against
    // what a browser actually paints, which is the thing that matters.
    for (const id of ['buttons', 'fields', 'type-scale', 'tabs', 'dropdowns']) {
      const gaps = page.locator(`[data-section="${id}"] [data-gap]`)
      await expect(gaps, `${id} is complete but shows a gap`).toHaveCount(0)
    }
  })
})
```

- [ ] **Step 2: Run and interpret**

Run: `npm run test:e2e`
Expected: PASS — 8 tests.

**If the overflow guard fails, that is a real finding, not a broken test.** Report exactly which section and element, and stop rather than adding an exclusion to make it green. The whole point of this task is to surface defects the unit suite cannot.

- [ ] **Step 3: Document when to run it**

Add a short section to `docs/superpowers/specs/2026-08-29-design-system-design.md`, near §12's verification surface, recording that `npm run test:e2e` is a fourth gate, run once per section rather than per edit, and naming the three bugs it exists to prevent recurring. Keep it to a short paragraph.

- [ ] **Step 4: Commit**

Run: `npx vitest run && npm run verify:css && npm run lint && npm run test:e2e`

```bash
git add e2e/ docs/
git commit -m "test(ds): guard against overflow and gap regressions across the page"
```

---

## Self-Review

**Spec coverage.** This plan implements a verification surface, not a spec section, so it adds no Appendix C values. §12 gains a paragraph recording the fourth gate (Task 3, Step 3). Each of the three regression tests cites the defect it reproduces.

**The mutation step is the point.** Task 2 Step 3 is not optional polish: a layout suite that has never been proven to fail is indistinguishable from no suite. All three mutations are one-line and reversible, and the task requires `git diff` on `src/` to be empty afterwards.

**Determinism.** Every assertion either compares two live elements (`statBox.x` vs `headingBox.x`, `panelBox.width` vs `triggerBox.width`, card tops against each other) or checks a boolean overflow condition. None depends on font metrics or timing. The viewport is fixed at 1280×900 and the page's own `max-w-5xl` is what constrains content, so the assertions hold on any machine.

**Tolerances.** 2px throughout, to absorb sub-pixel rounding and a 1px border — tight enough that the three real defects (≈24px, a whole wrapped row, ≈100px) all fail loudly.

**Cost, stated honestly.** A dev dependency plus a ~150MB browser binary, and a slow gate (a full production build per run). That is why it stays out of the inner loop and runs once per section. The alternative has been three defects reaching the branch and being caught by the user.

**Known limitation.** This suite runs Chromium only. Cross-browser rendering differences are out of scope; the defects it targets are layout-algorithm bugs, not vendor quirks.
